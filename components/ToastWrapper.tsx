import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { InterfaceToastProps } from "@gluestack-ui/toast/lib/types";

type actionType = "error" | "warning" | "success" | "info" | "muted" | undefined;
type variantType = "solid" | "outline" | undefined;
type ToastType = {
    show: (props: InterfaceToastProps) => string;
    close: (id: string) => void;
    closeAll: () => void;
    isActive: (id: string) => boolean;
}; // types may need to be adjusted based on updates to gluestack-ui

const showNewToast = (toast: ToastType,title: string, description: string, action: actionType = "muted", variant: variantType = undefined) => {
    toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => {
            const uniqueToastId = "toast-" + id;
            return (
                <Toast nativeID={uniqueToastId} action={action} variant={variant}>
                <ToastTitle>{title}</ToastTitle>
                <ToastDescription>
                    {description}
                </ToastDescription>
                </Toast>
            )
        },
    });
}

export default showNewToast;