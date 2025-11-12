'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { financeRequestSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const schema = financeRequestSchema;

type FormValues = z.infer<typeof schema>;

export function FinanceApplyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get('jobId') || '';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobId,
      amount: 100000,
      productType: 'material_financing',
      justification: ''
    }
  });

  const submit = async (values: FormValues) => {
    const response = await fetch('/api/v1/finance/material-financing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      toast.error('Failed to submit');
      return;
    }

    toast.success('Financing request submitted');
    router.push('/dashboard/finance');
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="jobId">Job ID</Label>
        <Input id="jobId" {...form.register('jobId')} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" {...form.register('amount', { valueAsNumber: true })} min={1000} step={1000} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="productType">Product Type</Label>
        <select
          id="productType"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          {...form.register('productType')}
        >
          <option value="material_financing">Material Financing</option>
          <option value="payroll_advance">Payroll Advance</option>
          <option value="invoice_factoring">Invoice Factoring</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="justification">Use of Funds</Label>
        <Textarea id="justification" rows={5} {...form.register('justification')} placeholder="Detail how funds will be deployed and repaid." />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
}
