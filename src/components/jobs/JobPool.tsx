import React, { useMemo, useState } from 'react';
import { demoJobs, Job, jobStatuses } from '@/data/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import JobWizard from './JobWizard';

const JobPool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [selected, setSelected] = useState<Job | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const q = query.toLowerCase();
      const match =
        j.roNumber.includes(query) ||
        j.make.toLowerCase().includes(q) ||
        j.model.toLowerCase().includes(q) ||
        j.vin.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      const matchStatus = status ? j.status === status : true;
      return match && matchStatus;
    });
  }, [jobs, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
        <div className="flex gap-2 items-center">
          <Input placeholder="Search (RO, VIN, location, vehicle)" value={query} onChange={(e) => setQuery(e.target.value)} className="w-80" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {jobStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-600">{filtered.length} item(s)</div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>RO #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Status Date</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((j) => (
              <TableRow key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(j); setOpen(true); }}>
                <TableCell>ADAS Map</TableCell>
                <TableCell>{j.location}</TableCell>
                <TableCell>{j.roNumber}</TableCell>
                <TableCell>{j.status}</TableCell>
                <TableCell>{new Date(j.statusDate).toLocaleString()}</TableCell>
                <TableCell>{j.year}</TableCell>
                <TableCell>{j.make}</TableCell>
                <TableCell>{j.model}</TableCell>
                <TableCell className="font-mono text-xs">{j.vin}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(j); setOpen(true); }}>View</Button>
                    <Button size="sm" onClick={() => setJobs((prev) => prev.map((x) => x.id === j.id ? { ...x, status: 'Assigned', statusDate: new Date().toISOString() } : x))}>Assign</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <JobWizard
        open={open}
        onOpenChange={setOpen}
        job={selected}
        onUpdate={(next) => setJobs((prev) => prev.map((j) => j.id === next.id ? next : j))}
      />
    </div>
  );
};

export default JobPool;
