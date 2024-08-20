import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Login() {
  const { login } = usePrivy();

  return (
    <div className="py-6 grid place-items-center">
      <div className="md:max-w-6xl w-full mt-8 grid gap-12">
        <p className="max-w-[40rem] md:text-[4rem] text-5xl leading-tight tracking-wide px-4 md:px-0">
          The modular confidential computing network
        </p>
        <p className="md:max-w-[40rem] text-xl text-[#727272] px-4 md:px-0">
          Inco is the universal confidentiality layer of web3, powered by FHE
          and secured by Ethereum, enabling the development of next frontier
          decentralized applications (dApps), providing confidentiality to
          existing blockchains, and breaking down the final barrier to Web3
          adoption at scale.
        </p>
        <div className="max-w-[40rem] flex items-center gap-5 px-4 md:px-0">
          <Button onClick={login} className="w-44 h-14 rounded-2xl">
            Connect Wallet
          </Button>
          <Link href="https://docs.inco.org/">
            <Button variant="outline" className="w-44 h-14 rounded-2xl">
              See Docs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
