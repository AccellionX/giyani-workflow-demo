import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EligibilityResult, IntakeDraft } from '@/api/contracts'
import { useClinicians, useEligibilityCheck, useSubmitIntake } from '@/api/hooks/useIntake'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Select,
  Stepper,
  useToast,
} from '@/components/ui'
import { labelize } from '@/features/dashboard/statusBadge'
import { clearIntakeDraft, loadIntakeDraft, saveIntakeDraft } from './draftStorage'
import {
  appointmentSchema,
  emptyDraft,
  INTAKE_STEPS,
  insuranceSchema,
  patientDetailsSchema,
} from './schema'

function eligibilityTone(result: EligibilityResult | null) {
  if (result === 'eligible') return 'success' as const
  if (result === 'not_eligible') return 'danger' as const
  if (result === 'needs_review') return 'warning' as const
  return 'neutral' as const
}

function persist(draft: IntakeDraft) {
  saveIntakeDraft(draft)
}

export function IntakePage() {
  const toast = useToast()
  const initial = loadIntakeDraft()
  const [draft, setDraft] = useState<IntakeDraft>(initial)
  const [step, setStep] = useState(initial.step)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const cliniciansQuery = useClinicians()
  const eligibilityMutation = useEligibilityCheck()
  const submitMutation = useSubmitIntake()

  const detailsForm = useForm({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: initial.patientDetails,
    mode: 'onBlur',
  })

  const insuranceForm = useForm({
    resolver: zodResolver(insuranceSchema),
    defaultValues: initial.insurance,
    mode: 'onBlur',
  })

  const appointmentForm = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: initial.appointment,
    mode: 'onBlur',
  })

  useEffect(() => {
    persist({ ...draft, step })
  }, [draft, step])

  useEffect(() => {
    const subscription = detailsForm.watch((values) => {
      setDraft((prev) => ({
        ...prev,
        patientDetails: {
          firstName: values.firstName ?? '',
          lastName: values.lastName ?? '',
          dateOfBirth: values.dateOfBirth ?? '',
          email: values.email ?? '',
          phone: values.phone ?? '',
          address: values.address ?? '',
          city: values.city ?? '',
          state: values.state ?? '',
          zip: values.zip ?? '',
        },
      }))
    })
    return () => subscription.unsubscribe()
  }, [detailsForm])

  useEffect(() => {
    const subscription = insuranceForm.watch((values) => {
      setDraft((prev) => ({
        ...prev,
        insurance: {
          carrier: values.carrier ?? '',
          memberId: values.memberId ?? '',
          groupNumber: values.groupNumber ?? '',
          eligibilityResult: values.eligibilityResult ?? null,
        },
      }))
    })
    return () => subscription.unsubscribe()
  }, [insuranceForm])

  useEffect(() => {
    const subscription = appointmentForm.watch((values) => {
      setDraft((prev) => ({
        ...prev,
        appointment: {
          date: values.date ?? '',
          time: values.time ?? '',
          visitType: values.visitType ?? 'new_patient',
          clinicianId: values.clinicianId ?? '',
          notes: values.notes ?? '',
        },
      }))
    })
    return () => subscription.unsubscribe()
  }, [appointmentForm])

  async function goNextFromDetails() {
    const valid = await detailsForm.trigger()
    if (valid) setStep(1)
  }

  async function goNextFromInsurance() {
    const valid = await insuranceForm.trigger()
    if (valid) setStep(2)
  }

  async function goNextFromAppointment() {
    const valid = await appointmentForm.trigger()
    if (valid) setStep(3)
  }

  async function runEligibility() {
    const values = insuranceForm.getValues()
    const basicValid = await insuranceForm.trigger(['carrier', 'memberId', 'groupNumber'])
    if (!basicValid) return

    try {
      const result = await eligibilityMutation.mutateAsync({
        carrier: values.carrier,
        memberId: values.memberId,
        groupNumber: values.groupNumber,
        dateOfBirth: detailsForm.getValues('dateOfBirth'),
      })
      insuranceForm.setValue('eligibilityResult', result.result, { shouldValidate: true })
      toast.push(result.message, result.result === 'eligible' ? 'success' : 'info')
    } catch (error) {
      toast.push(error instanceof Error ? error.message : 'Eligibility check failed', 'error')
    }
  }

  async function submitIntake() {
    try {
      const response = await submitMutation.mutateAsync({ draft: { ...draft, step } })
      clearIntakeDraft()
      setSubmittedId(response.patientId)
      toast.push(response.message, 'success')
    } catch (error) {
      toast.push(error instanceof Error ? error.message : 'Submit failed', 'error')
    }
  }

  function resetWorkflow() {
    const fresh = emptyDraft()
    clearIntakeDraft()
    setDraft(fresh)
    setStep(0)
    setSubmittedId(null)
    detailsForm.reset(fresh.patientDetails)
    insuranceForm.reset(fresh.insurance)
    appointmentForm.reset(fresh.appointment)
  }

  if (submittedId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card title="Intake submitted">
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
              The mock API accepted this intake and created patient{' '}
              <span className="font-semibold text-slate-900">{submittedId}</span>.
            </p>
            <p className="text-sm text-slate-500">
              If eligibility was not fully eligible, a review queue item was also created.
            </p>
            <Button onClick={resetWorkflow}>Start another intake</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New patient intake</h1>
        <p className="mt-1 text-sm text-slate-500">
          Four-step workflow with per-step validation and draft persistence.
        </p>
      </div>

      <Card>
        <Stepper steps={[...INTAKE_STEPS]} currentStep={step} />
      </Card>

      {step === 0 ? (
        <Card title="Patient details" description="Demographics for the new chart">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              void goNextFromDetails()
            }}
          >
            <Input
              label="First name"
              {...detailsForm.register('firstName')}
              error={detailsForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last name"
              {...detailsForm.register('lastName')}
              error={detailsForm.formState.errors.lastName?.message}
            />
            <Input
              label="Date of birth"
              type="date"
              {...detailsForm.register('dateOfBirth')}
              error={detailsForm.formState.errors.dateOfBirth?.message}
            />
            <Input
              label="Phone"
              {...detailsForm.register('phone')}
              error={detailsForm.formState.errors.phone?.message}
            />
            <Input
              label="Email"
              type="email"
              className="md:col-span-2"
              {...detailsForm.register('email')}
              error={detailsForm.formState.errors.email?.message}
            />
            <Input
              label="Address"
              className="md:col-span-2"
              {...detailsForm.register('address')}
              error={detailsForm.formState.errors.address?.message}
            />
            <Input
              label="City"
              {...detailsForm.register('city')}
              error={detailsForm.formState.errors.city?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                {...detailsForm.register('state')}
                error={detailsForm.formState.errors.state?.message}
              />
              <Input
                label="ZIP"
                {...detailsForm.register('zip')}
                error={detailsForm.formState.errors.zip?.message}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card title="Insurance & eligibility" description="Mock async check (~1.5s)">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void goNextFromInsurance()
            }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Carrier"
                {...insuranceForm.register('carrier')}
                error={insuranceForm.formState.errors.carrier?.message}
              />
              <Input
                label="Member ID"
                hint="Ends with R → needs review; X → not eligible"
                {...insuranceForm.register('memberId')}
                error={insuranceForm.formState.errors.memberId?.message}
              />
              <Input
                label="Group number"
                {...insuranceForm.register('groupNumber')}
                error={insuranceForm.formState.errors.groupNumber?.message}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                loading={eligibilityMutation.isPending}
                onClick={() => void runEligibility()}
              >
                Run eligibility check
              </Button>
              {draft.insurance.eligibilityResult ? (
                <Badge tone={eligibilityTone(draft.insurance.eligibilityResult)}>
                  {labelize(draft.insurance.eligibilityResult)}
                </Badge>
              ) : (
                <span className="text-sm text-slate-500">No check run yet</span>
              )}
            </div>
            {insuranceForm.formState.errors.eligibilityResult?.message ? (
              <p className="text-xs text-rose-600" role="alert">
                {insuranceForm.formState.errors.eligibilityResult.message}
              </p>
            ) : null}

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card title="Schedule appointment" description="Preferred visit window">
          {cliniciansQuery.isError ? (
            <ErrorState
              message={
                cliniciansQuery.error instanceof Error
                  ? cliniciansQuery.error.message
                  : 'Failed to load clinicians'
              }
              onRetry={() => void cliniciansQuery.refetch()}
            />
          ) : null}
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void goNextFromAppointment()
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Date"
                type="date"
                {...appointmentForm.register('date')}
                error={appointmentForm.formState.errors.date?.message}
              />
              <Input
                label="Time"
                type="time"
                {...appointmentForm.register('time')}
                error={appointmentForm.formState.errors.time?.message}
              />
              <Select
                label="Visit type"
                options={[
                  { value: 'new_patient', label: 'New patient visit' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'telehealth', label: 'Telehealth' },
                ]}
                {...appointmentForm.register('visitType')}
                error={appointmentForm.formState.errors.visitType?.message}
              />
              <Select
                label="Clinician"
                options={[
                  { value: '', label: cliniciansQuery.isLoading ? 'Loading…' : 'Select clinician' },
                  ...(cliniciansQuery.data ?? []).map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
                {...appointmentForm.register('clinicianId')}
                error={appointmentForm.formState.errors.clinicianId?.message}
              />
              <Input
                label="Notes"
                className="md:col-span-2"
                {...appointmentForm.register('notes')}
              />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card title="Review & submit" description="Confirm before creating the mock patient">
          <div className="space-y-4 text-sm">
            <section className="rounded-lg border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900">Patient</h3>
              <p className="mt-2 text-slate-600">
                {draft.patientDetails.firstName} {draft.patientDetails.lastName}
                <br />
                {draft.patientDetails.email} · {draft.patientDetails.phone}
                <br />
                DOB {draft.patientDetails.dateOfBirth}
              </p>
            </section>
            <section className="rounded-lg border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900">Insurance</h3>
              <p className="mt-2 text-slate-600">
                {draft.insurance.carrier}
                <br />
                Member {draft.insurance.memberId} · Group {draft.insurance.groupNumber}
              </p>
              <div className="mt-2">
                <Badge tone={eligibilityTone(draft.insurance.eligibilityResult)}>
                  {draft.insurance.eligibilityResult
                    ? labelize(draft.insurance.eligibilityResult)
                    : 'Unchecked'}
                </Badge>
              </div>
            </section>
            <section className="rounded-lg border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900">Appointment</h3>
              <p className="mt-2 text-slate-600">
                {draft.appointment.date} at {draft.appointment.time}
                <br />
                {labelize(draft.appointment.visitType)} · Clinician {draft.appointment.clinicianId}
              </p>
            </section>
            {!draft.patientDetails.firstName ? (
              <EmptyState
                title="Draft incomplete"
                description="Go back and complete earlier steps before submitting."
              />
            ) : null}
            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                type="button"
                loading={submitMutation.isPending}
                onClick={() => void submitIntake()}
              >
                Submit intake
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
