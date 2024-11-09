import CredentialsProvider from "next-auth/providers/credentials"
import { RequestInternal, Awaitable, User } from "next-auth";

export const options = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "email:",
                    type: "text",
                    placeholder: "your-email"
                },
                password: {
                    label: "password:",
                    type: "text",
                    placeholder: "your-password"
                }
            },
            authorize: function (credentials: Record<"email", string> | undefined, req: Pick<RequestInternal, "body" | "query" | "headers" | "method">): Awaitable<User | null> {
                throw new Error("Function not implemented.");
            }
        })

    ]
    // ,
    // callbacks: {
    //     async jwt({ token, user }){
    //         if (user) token.role = user.role
    //         return token
    //     },
    //     async session ({ session, token }){
    //         if (session?.user) session.user.role  = token.role;
    //         return session
    //     }
    // }

}