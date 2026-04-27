import * as React from 'react';
import {useState, useEffect} from 'react';
import settings from '@config/settings.ts';
import {CardTemplate, StarterTemplate} from '@views/templates.tsx';
import {useForm} from 'react-hook-form';
import type {SubmitHandler} from 'react-hook-form';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {InsightsAPI} from '@core/services.ts';
import type {InsightCategory} from '@core/types.ts';
import {FormFieldError} from '@components/essentials.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent} from '@/components/ui/card.tsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination.tsx';
import {useQuery} from '@tanstack/react-query';
import uipaths from '@config/paths.ts';
import {useAuthStore} from '@core/stores.ts';


const CATEGORIES: {value: InsightCategory; label: string}[] = [
  {value: 'macro', label: 'Macro'},
  {value: 'equities', label: 'Equities'},
  {value: 'fixedincome', label: 'Fixed Income'},
  {value: 'alternatives', label: 'Alternatives'},
];

const insightSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.enum(['macro', 'equities', 'fixedincome', 'alternatives']),
  body: z.string().min(10).max(10000),
  tags: z.string(),
});
type InsightFormSchema = z.infer<typeof insightSchema>;

const parseTags = (raw: string): string[] =>
  raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);


const InsightForm = ({
  pageTitle,
  defaultValues,
  onSubmit,
}: {
  pageTitle: string;
  defaultValues?: Partial<InsightFormSchema>;
  onSubmit: (data: InsightFormSchema) => Promise<void>;
}) => {
  const [formAlert, setFormAlert] = useState('');
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<InsightFormSchema>({
    resolver: zodResolver(insightSchema),
    defaultValues,
  });

  // @ts-ignore
  const handleFormSubmit: SubmitHandler<InsightFormSchema> = async (data) => {
    if (isSubmitting) return;
    setFormAlert('');

    try {
      setLoading(true);
      await onSubmit(data);
    } catch (e: any) {
      const d = e?.response?.data;
      const detail =
        (d && typeof d === 'object' ? Object.values(d).flat().join(' ') : null) ??
        e?.message ??
        'Something went wrong.';
      setFormAlert(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardTemplate className="max-w-[600px] mx-auto mt-20">
      <Card className="py-0 mx-5 md:mx-0">
        <CardContent className="p-5">
          <header>
            <h1 className="text-3xl pl-5">{pageTitle}</h1>
          </header>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 pt-2 p-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input id="title" type="text" {...register('title')} />
              {errors.title && <FormFieldError message={errors.title.message!} />}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                {...register('category')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <FormFieldError message={errors.category.message!} />}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="body" className="text-sm font-medium">Body</label>
              <textarea
                id="body"
                rows={6}
                {...register('body')}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              {errors.body && <FormFieldError message={errors.body.message!} />}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="tags" className="text-sm font-medium">Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
              <Input id="tags" type="text" placeholder="inflation, rates, cpi" {...register('tags')} />
              {errors.tags && <FormFieldError message={errors.tags.message!} />}
            </div>
            {formAlert && <div className="text-xs text-red-500">{formAlert}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CardTemplate>
  );
};


export const CreateInsightPage = () => {
  const pageTitle = 'Create Insight';
  const navigate = useNavigate();

  const onSubmit = async (data: InsightFormSchema) => {
    await InsightsAPI.create({
      title: data.title,
      category: data.category as InsightCategory,
      body: data.body,
      tags: parseTags(data.tags),
    });
    navigate(uipaths.insights);
  };

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <div id="content">
        <InsightForm pageTitle={pageTitle} onSubmit={onSubmit} />
      </div>
    </>
  );
};


export const UpdateInsightPage = () => {
  const pageTitle = 'Edit Insight';
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();

  const [defaultValues, setDefaultValues] = useState<Partial<InsightFormSchema> | null>(null);

  useEffect(() => {
    if (!id) return;
    InsightsAPI.get(Number(id)).then(insight => {
      setDefaultValues({
        title: insight.title,
        category: insight.category,
        body: insight.body,
        tags: insight.tags.join(', '),
      });
    });
  }, [id]);

  const onSubmit = async (data: InsightFormSchema) => {
    await InsightsAPI.update(Number(id), {
      title: data.title,
      category: data.category as InsightCategory,
      body: data.body,
      tags: parseTags(data.tags),
    });
    navigate(uipaths.insights);
  };

  if (!defaultValues) {
    return (
      <>
        <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
        <StarterTemplate><p className="p-8 text-sm text-muted-foreground">Loading…</p></StarterTemplate>
      </>
    );
  }

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <div id="content">
        <InsightForm pageTitle={pageTitle} defaultValues={defaultValues} onSubmit={onSubmit} />
      </div>
    </>
  );
};


const PAGE_SIZE = 10;

const buildPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

export const ListInsightsPage = () => {
  const pageTitle = 'Insights';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const category = searchParams.get('category') ?? '';

  const {data, isLoading} = useQuery({
    queryKey: ['insights', {page, category}],
    queryFn: () => InsightsAPI.list({page, ...(category ? {category} : {})}),
  });

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  const setPage = (p: number) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });

  const setCategory = (cat: string) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat) next.set('category', cat);
      else next.delete('category');
      next.set('page', '1');
      return next;
    });

  const insights = data?.results ?? [];
  const isEmpty = !isLoading && insights.length === 0;

  // @ts-ignore
  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold">Insights</h1>
            <Button onClick={() => navigate(uipaths.createInsight)}>New Insight</Button>
          </div>

          <div className="mb-4">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {isEmpty && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">You don't have any Insights yet.</p>
              <Button className="mt-4" onClick={() => navigate(uipaths.createInsight)}>
                Create your first Insight
              </Button>
            </div>
          )}

          <ul className="flex flex-col gap-4">
            {insights.map(insight => (
              <li key={insight.id}>
                <Card className="py-0">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium">{insight.title}</h2>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{insight.category}</p>
                        {insight.tags.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">{insight.tags.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(uipaths.insightDetail(insight.id))}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(uipaths.updateInsight(insight.id))}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(page - 1)}
                      aria-disabled={page <= 1}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {buildPageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(page + 1)}
                      aria-disabled={page >= totalPages}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </StarterTemplate>
    </>
  );
};


const CATEGORY_LABELS: Record<InsightCategory, string> = {
  macro: 'Macro',
  equities: 'Equities',
  fixedincome: 'Fixed Income',
  alternatives: 'Alternatives',
};

export const InsightDetailPage = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const isAuth = useAuthStore(s => s.isAuth);

  const {data: insight, isLoading, isError} = useQuery({
    queryKey: ['insight', id],
    queryFn: () => InsightsAPI.get(Number(id)),
  });

  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this insight?')) return;
    try {
      setDeleting(true);
      await InsightsAPI.delete(Number(id));
      navigate(uipaths.insights);
    } catch {
      setDeleteError('Failed to delete. You may not have permission.');
      setDeleting(false);
    }
  };

  const pageTitle = insight?.title ?? 'Insight';

  if (isLoading) {
    return (
      <>
        <title>{`Loading… | ${settings.SITENAME}`}</title>
        <StarterTemplate><p className="p-8 text-sm text-muted-foreground">Loading…</p></StarterTemplate>
      </>
    );
  }

  if (isError || !insight) {
    return (
      <>
        <title>{`Not Found | ${settings.SITENAME}`}</title>
        <StarterTemplate>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <p className="text-muted-foreground">Insight not found.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(uipaths.insights)}>
              Back to Insights
            </Button>
          </div>
        </StarterTemplate>
      </>
    );
  }

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(uipaths.insights)}>
              ← Back
            </Button>
          </div>

          <Card className="py-0">
            <CardContent className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold">{insight.title}</h1>
                {isAuth && (
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(uipaths.updateInsight(insight.id))}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="capitalize font-medium">{CATEGORY_LABELS[insight.category]}</span>
                <span>·</span>
                <span>{new Date(insight.created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                {insight.updated_at !== insight.created_at && (
                  <>
                    <span>·</span>
                    <span>Updated {new Date(insight.updated_at).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                  </>
                )}
              </div>

              {insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {insight.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{tag}</span>
                  ))}
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight.body}</p>

              {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
            </CardContent>
          </Card>
        </div>
      </StarterTemplate>
    </>
  );
};
