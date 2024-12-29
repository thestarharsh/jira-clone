import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]();
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success(" Logout Successful.");
            queryClient.invalidateQueries({ queryKey: ["current"] });
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            router.replace("/sign-in");
        },
        onError: () => {
            toast.error("Failed to log out.");
        },
    });

    return mutation;
};
