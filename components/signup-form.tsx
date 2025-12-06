"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useUserRegisterMutation } from "@/redux/features/auth/auth.api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  });

  type SignupSchema = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const [userRegister, { isLoading }] = useUserRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: SignupSchema) => {
    const { confirmPassword, ...payload } = data;
    console.log(payload);
    if (payload.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await userRegister(payload).unwrap();
      if(res.success){
        toast.success("User registered successfully");
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.data.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="focus-visible:ring-[#1FB67A]"
                  {...register("name")}
                />
                {errors.name && (
                  <FieldDescription className="text-red-500">
                    {errors.name.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="focus-visible:ring-[#1FB67A]"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldDescription className="text-red-500">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="focus-visible:ring-[#1FB67A]"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <FieldDescription className="text-red-500">
                        {errors.password.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="focus-visible:ring-[#1FB67A]"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </Field>
                  {errors.confirmPassword && (
                    <FieldDescription className="text-red-500">
                      {errors.confirmPassword.message}
                    </FieldDescription>
                  )}
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ backgroundColor: '#1FB67A', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1dd489'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login" className="text-[#1FB67A] hover:text-[#1dd489] hover:underline transition-colors">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#" className="text-[#1FB67A] hover:text-[#1dd489] hover:underline transition-colors">Terms of Service</a>{" "}
        and <a href="#" className="text-[#1FB67A] hover:text-[#1dd489] hover:underline transition-colors">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
