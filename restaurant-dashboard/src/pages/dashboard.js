import Head from "next/head";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Tableau de bord – Restaurant</title>
      </Head>
      <Sidebar />
    </>
  );
}
