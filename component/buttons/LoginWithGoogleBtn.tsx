"use client"
import { signInWithGoogle } from "@/app/lib/auth-client"
import Image from "next/image"
import { usePathname, useParams } from "next/navigation"

export default function LoginWithGoogleBtn({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname()
    const params = useParams()

    const handleLogin = async () => {
        if (pathname?.includes("/accept-invitation/")) {
            const invitationId = params?.invitationId
            await signInWithGoogle(`/auth/invitation-callback?invitationId=${invitationId}`)
        } else {
            await signInWithGoogle()
        }
    }

    return(
        <button
          onClick={handleLogin}
          className={`flex items-center active:scale-96 transition-all duration-100 ease-in-out justify-center bg-[#EFEFEF] border border-[#D0CECE] cursor-pointer hover:bg-gray-200 transition-colors ${
            isMobile
              ? "w-[83px] h-[31px] rounded-[5px]"
              : "w-[118px] h-[44px] rounded-[7px]"
          }`}
        >
            <Image
              src="/images/google.png"
              width={isMobile ? 23 : 33}
              height={isMobile ? 23 : 33}
              alt="Login with Google"
            />
        </button>
    )
}