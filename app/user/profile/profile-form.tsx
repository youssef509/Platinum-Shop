'use client';
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProfileSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/user.actions";


const ProfileForm = () => {
    const { data: session, update } = useSession();

    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
        }
    });

    const { toast } = useToast();

    const onSubmit = async  (values: z.infer<typeof updateProfileSchema>) => {
        const res = await updateProfile(values);
        if (!res.success) {
            return toast({
                variant: 'destructive',
                title: 'Error',
                description: res.message,
            });
        }
        const newSession = {
            ...session,
            user: {
                ...session?.user,
                name: values.name,
                email: values.email,
            }
        };
        await update(newSession);
        toast({
            title: 'Success',
            description: res.message,
        });
        form.reset(values);
    }
    return (
        <Form {...form}>
            <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Name" className="input-field" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Email" className="input-field" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" size="lg" className="button col-span-2 w-full" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
                </Button>
            </form>
        </Form>
    );
}
 
export default ProfileForm;