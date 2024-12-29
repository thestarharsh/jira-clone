import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register["$post"]({ json });
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("User Registered Successfully.");
            queryClient.invalidateQueries({ queryKey: ["current"] });
            router.replace("/");
        },
        onError: () => {
            toast.error("Registration failed.");
        },
    });

    return mutation;
};
