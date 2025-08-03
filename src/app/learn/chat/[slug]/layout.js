import Sidebar from "@/components/Sidebar";

export default function Layout({children}) {
  return (
    <section>
      <Sidebar>{children}</Sidebar>
    </section>
  );
}
