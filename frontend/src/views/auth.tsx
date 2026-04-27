import * as React from 'react';
import settings from '@config/settings.ts';
import {CardTemplate, StarterTemplate} from '@views/templates.tsx';
import {useForm} from 'react-hook-form';
import type {SubmitHandler} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useState} from 'react';
import {AuthAPI} from '@core/services.ts';
import {loginAction} from '@auth/actions.ts';
import {FormFieldError} from '@components/essentials.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const registerSchema = z.object({
  username: z.string().min(3).max(150),
  email: z.string().email(),
  password: z.string().min(settings.PASSWORD_MIN),
  re_password: z.string().min(settings.PASSWORD_MIN),
}).refine((data) => data.password === data.re_password, {
  message: 'Passwords do not match.',
  path: ['re_password'],
});
type RegisterFormSchema = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const pageTitle = 'Register';
  const navigate = useNavigate();

  const [formAlert, setFormAlert] = useState('');
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
  });

  // @ts-ignore
  const onSubmit: SubmitHandler<RegisterFormSchema> = async ({username, email, password, re_password}) => {
    if (isSubmitting) return;
    setFormAlert('');

    try {
      setLoading(true);
      await AuthAPI.register(username, email, password, re_password);
      navigate('/login');
    } catch (e: any) {
      const data = e?.response?.data;
      const detail =
        (data && typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : null) ??
        e?.message ??
        'Registration failed.';
      setFormAlert(detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <div id="content">
        <CardTemplate className="max-w-[400px] mx-auto mt-20">
          <Card className="py-0 mx-5 md:mx-0">
            <CardContent className="p-5">
              <header>
                <h1 className="text-3xl pl-5">Register</h1>
              </header>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2 p-5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input id="username" type="text" autoComplete="username" {...register('username')} />
                  {errors.username && <FormFieldError message={errors.username.message!} />}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" autoComplete="email" {...register('email')} />
                  {errors.email && <FormFieldError message={errors.email.message!} />}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                  {errors.password && <FormFieldError message={errors.password.message!} />}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="re_password" className="text-sm font-medium">Confirm Password</label>
                  <Input id="re_password" type="password" autoComplete="new-password" {...register('re_password')} />
                  {errors.re_password && <FormFieldError message={errors.re_password.message!} />}
                </div>
                {formAlert && <div className="text-xs text-red-500">{formAlert}</div>}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Registering…' : 'Register'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </CardTemplate>
      </div>
    </>
  );
}

const schema = z.object({
  username: z.string().min(3).max(150),
  password: z.string().min(settings.PASSWORD_MIN),
})
type FormSchema = z.infer<typeof schema>;

export const LoginPage = () => {
  const pageTitle = 'Login';
  const navigate = useNavigate();

  const [formAlert, setFormAlert] = useState('');
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  // @ts-ignore
  const onSubmit: SubmitHandler<FormSchema> = async ({username, password}) => {
    if (isSubmitting) return;
    setFormAlert('');

    try {
      setLoading(true);
      const accessToken = await AuthAPI.login(username, password);
      await loginAction(accessToken);
      navigate('/');
    } catch (e: any) {
      const detail = e?.response?.data?.detail ?? e?.message ?? 'Login failed.';
      setFormAlert(detail);
    } finally {
      setLoading(false);
    }
  }

  // @ts-ignore
  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <div id="content">
        <CardTemplate className="max-w-[400px] mx-auto mt-20">
          <Card className="py-0 mx-5 md:mx-0">
            <CardContent className="p-5">
              <header>
                <h1 className="text-3xl pl-5">Login</h1>
              </header>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2 p-5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input id="username" type="text" autoComplete="username"{...register('username')} />
                  {errors.username && <FormFieldError message={errors.username.message!} />}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input id="password" type="password"
                         autoComplete="current-password"{...register('password')}
                  />
                  {errors.password && <FormFieldError message={errors.password.message!} />}
                </div>
                {formAlert && <div className="text-xs text-red-500">{formAlert}</div>}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Logging in…' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </CardTemplate>
      </div>
    </>
  );
}


