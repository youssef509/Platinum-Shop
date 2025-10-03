'use client';
import { useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

const DeleteDialog = ({ 
    id, 
    action 
}: {
    id: string;
    action: (id: string) => Promise<{success: boolean; message: string}>;
}) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDeleteClick = async () => {
        startTransition(async () => {
            const result = await action(id);
            if (result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ title: "Error", description: result.message });
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-2">
                    Delete
                </Button>
            </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteClick} disabled={isPending}>
                    {isPending ? "Deleting..." : "Delete"}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)};

export default DeleteDialog;