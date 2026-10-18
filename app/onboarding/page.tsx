"use client";

import PrimaryBtn from "@/component/buttons/PrimaryBtn";
import CenterLoader from "@/component/CenterLoader";
import Image from "next/image";
import { useEffect, useState } from "react";
import slugify from "slugify";
import { authClient } from "../lib/auth-client";
import { AppError } from "../lib/error-handler";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter()
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orgs && orgs.length > 0) {
      router.replace("/dashboard/admin");
    }
  }, [orgs, router]);

  const handleCreateOrganization = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.organization.create({
        name: orgName,
        slug,
      })

      if (error) {
        console.error("Error creating organization:", error);
        throw new AppError("Error creating organization", 400)
      }

      await authClient.organization.setActive({
        organizationId: data?.id
      })


      router.replace("/dashboard/admin")
    } finally {
      setIsLoading(false);
    }
  }

  const formatSlugInput = (input: string) => {
    return input
      .toLowerCase()
      .split("")
      .filter((char) => {
        return (char >= "a" && char <= "z") || (char >= "0" && char <= "9") || char === "-";
      })
      .join("");
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrgName(value);
    setSlug(slugify(value, { lower: true, strict: true }));
  };

  if (orgsPending || (orgs && orgs.length > 0)) {
    return <CenterLoader text="Checking your workspace..." />;
  }

  return (
    <main className="min-h-screen bg-[#1F66FF] flex items-center justify-center p-4 sm:p-8 font-instrument">
      <div className="w-full max-w-[500px] bg-white rounded-[30px] p-8 sm:p-[40px] flex flex-col items-center shadow-2xl">
        {/* Header Section */}
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <Image src="/images/logo.png" width={30} height={30} alt="AutoClaimAI Logo" />
          <span className="text-[18px] font-semibold text-black">AutoClaimAI</span>
        </div>

        <div className="flex flex-col gap-2 items-center text-center mb-8 w-full">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-black leading-tight">
            Set up organization
          </h2>
          <p className="text-[14px] text-[#828282] font-inter">
            Create your insurance workspace to get started.
          </p>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-[31px]" onSubmit={(e) => e.preventDefault()}>

          <div className="flex flex-col gap-[10px]">
            <label htmlFor="orgName" className="text-[16px] sm:text-[17px] text-neutral-400">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={handleOrgNameChange}
              placeholder="e.g. ABC Insurance"
              className="w-full px-4 py-3 bg-[#F9F9F9] border border-[#D1D1D1] rounded-[7px] text-black outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-[10px]">
            <label htmlFor="slug" className="text-[16px] sm:text-[17px] text-neutral-400">
              Workspace Slug
            </label>
            <div className="relative flex items-center">
              {/* <span className="absolute left-4 text-[#828282] text-[15px] sm:text-[16px]">
                autoclaim.ai/
              </span> */}
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(formatSlugInput(e.target.value))}
                placeholder="abc-insurance"
                className="w-full px-4  py-3 bg-[#F9F9F9] border border-[#D1D1D1] rounded-[7px] text-black outline-none font-mono text-[16px]"
                required
              />
            </div>
            <p className="text-[12px] text-[#828282] font-inter mt-1">
              This is your workspace&apos;s unique identifier.
            </p>
          </div>

          <PrimaryBtn text="Create Organization" onClick={() => handleCreateOrganization()} isLoading={isLoading} />

        </form>
      </div>
    </main>
  );
}
