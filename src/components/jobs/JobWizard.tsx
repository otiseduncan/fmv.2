import React, { useMemo, useState } from 'react';
import { Job, ServiceItem } from '@/data/jobs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ImageCapture from './ImageCapture';
import TechTracker from './TechTracker';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: Job | null;
  onUpdate: (job: Job) => void;
};

const steps = ["Review", "Services", "Pre-Check", "Actions", "Complete"] as const;

const JobWizard: React.FC<Props> = ({ open, onOpenChange, job, onUpdate }) => {
  const [step, setStep] = useState<(typeof steps)[number]>("Review");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const total = useMemo(() => {
    if (!job) return 0;
    return job.services.filter((s) => selected[s.id] ?? true).reduce((sum, s) => sum + s.price, 0);
  }, [job, selected]);

  if (!job) return null;

  const toggleService = (svc: ServiceItem) => {
    setSelected((p) => ({ ...p, [svc.id]: !(p[svc.id] ?? true) }));
  };

  const addPhoto = (file: { name: string; url: string }) => {
    const updated = {
      ...job,
      attachments: [
        ...job.attachments,
        { id: `${Date.now()}`, type: 'photo' as const, name: file.name, url: file.url, createdAt: new Date().toISOString() },
      ],
    };
    onUpdate(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Calibration Request #{job.id} — {job.location}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button className={`px-2 py-1 rounded ${step === s ? 'bg-green-600 text-white' : 'bg-gray-100'}`} onClick={() => setStep(s)}>
                {i + 1}. {s}
              </button>
              {i < steps.length - 1 && <div className="w-5 h-[2px] bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Content */}
        {step === 'Review' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div>RO Number: <b>{job.roNumber}</b></div>
                <div>Vehicle: {job.year} {job.make} {job.model}</div>
                <div>VIN: {job.vin}</div>
              </div>
              <div>
                <div>Insurance: {job.insurance || '—'}</div>
                <div>Status: {job.status}</div>
                <div>Techs: {job.technicianIds.length ? job.technicianIds.join(', ') : 'Unassigned'}</div>
              </div>
            </div>
            <TechTracker jobId={job.id} techId={job.technicianIds[0] || 'current-tech'} />
          </div>
        )}

        {step === 'Services' && (
          <div className="space-y-2">
            {job.services.map((svc) => (
              <label key={svc.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected[svc.id] ?? true}
                    onCheckedChange={() => toggleService(svc)}
                    id={`svc-${svc.id}`}
                  />
                  <div>
                    <div className="font-medium">{svc.name}</div>
                    {svc.details && <div className="text-xs text-gray-500">{svc.details}</div>}
                  </div>
                </div>
                <div className="text-right">${svc.price.toFixed(2)}</div>
              </label>
            ))}
            <div className="flex items-center justify-end text-sm font-medium">Total: ${total.toFixed(2)}</div>
          </div>
        )}

        {step === 'Pre-Check' && (
          <div className="space-y-3">
            {[
              'Initial Scan Results - Calibration',
              'Initial Scan Results - Diagnostics',
              'Initial Scan Results - Immobilizer',
              'Initial Scan Results - Programming/Initializations',
              'Initial Scan Results - Scan',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Checkbox id={item} checked={!!checklist[item]} onCheckedChange={() => setChecklist((p) => ({ ...p, [item]: !p[item] }))} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
            <div className="pt-2">
              <ImageCapture onAdd={addPhoto} />
            </div>
            {!!job.attachments.length && (
              <div className="grid grid-cols-4 gap-2">
                {job.attachments.map((a) => (
                  <img key={a.id} src={a.url} alt={a.name} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'Actions' && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id="res1" checked={!!checklist['Calibration Results']} onCheckedChange={() => setChecklist((p) => ({ ...p, ['Calibration Results']: !p['Calibration Results'] }))} />
              <Label htmlFor="res1">Calibration Results (attach screenshot if available)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="res2" checked={!!checklist['Pre/Post Scan']} onCheckedChange={() => setChecklist((p) => ({ ...p, ['Pre/Post Scan']: !p['Pre/Post Scan'] }))} />
              <Label htmlFor="res2">Pre or Post Scan Results</Label>
            </div>
            <ImageCapture onAdd={addPhoto} />
          </div>
        )}

        {step === 'Complete' && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              Review and verify that all checklists and actions have been completed.
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="final" checked={!!checklist['FinalAcceptance']} onCheckedChange={() => setChecklist((p) => ({ ...p, ['FinalAcceptance']: !p['FinalAcceptance'] }))} />
              <Label htmlFor="final">Final Calibration Verification</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setStep('Actions')}>Previous</Button>
              <Button onClick={() => onOpenChange(false)}>Complete (Save)</Button>
            </div>
          </div>
        )}

        {/* Footer navigation */}
        {step !== 'Complete' && (
          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(steps[Math.max(0, steps.indexOf(step) - 1)])}>Previous</Button>
            <Button onClick={() => setStep(steps[Math.min(steps.length - 1, steps.indexOf(step) + 1)])}>Next</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobWizard;

