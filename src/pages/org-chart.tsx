import { useMemo } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

type Node = {
  name: string;
  role: string;
  hue: number;
  tone?: string;
  children: Node[];
};

function NodeCard({ node, root = false }: { node: Node; root?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="inline-block"
    >
      <Card
        className={cn(
          "w-52 gap-0 py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
          root && "ring-2 ring-primary/40",
        )}
      >
        <CardContent className="flex flex-col items-center gap-1.5 p-3">
          <PersonAvatar name={node.name} hue={node.hue} className="size-14" />
          <div className="text-sm font-semibold leading-tight">{node.name}</div>
          <div
            className="text-xs leading-tight"
            style={{ color: `oklch(0.58 0.17 ${node.hue})` }}
          >
            {node.role}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TreeNode({ node, root = false }: { node: Node; root?: boolean }) {
  return (
    <li>
      <NodeCard node={node} root={root} />
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <TreeNode key={c.name + c.role} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function OrgChartPage() {
  const { interns } = useStore();

  const tree = useMemo<Node>(() => {
    const internsFor = (mentor: string): Node[] =>
      interns
        .filter((i) => i.mentor === mentor)
        .map((i) => ({ name: i.name, role: `Intern · ${i.department}`, hue: i.hue, children: [] }));

    return {
      name: "Ananya Rao",
      role: "Chief Executive Officer",
      hue: 262,
      children: [
        { name: "Priya Nair", role: "HR Manager", hue: 280, children: [] },
        {
          name: "Rahul Mehta",
          role: "Project Manager",
          hue: 200,
          children: [
            { name: "Sneha Iyer", role: "Team Lead", hue: 150, children: internsFor("Sneha Iyer") },
            { name: "Vikram Singh", role: "Software Engineer", hue: 240, children: internsFor("Vikram Singh") },
            { name: "Aditi Rao", role: "Software Engineer", hue: 320, children: internsFor("Rahul Mehta") },
          ],
        },
        { name: "Ethan Brown", role: "Senior Accountant", hue: 90, children: [] },
      ],
    };
  }, [interns]);

  const count = useMemo(() => {
    let n = 0;
    const walk = (node: Node) => {
      n++;
      node.children.forEach(walk);
    };
    walk(tree);
    return n;
  }, [tree]);

  return (
    <>
      <PageHeader
        title="Organization Chart"
        description="Reporting structure across leadership, teams and interns — interns report to their team leads."
      >
        <Badge variant="secondary">{count} people</Badge>
      </PageHeader>

      <Card className="overflow-hidden">
        <CardContent className="overflow-x-auto bg-gradient-to-b from-muted/40 to-transparent py-10">
          <ul className="org-tree inline-flex min-w-full justify-center">
            <TreeNode node={tree} root />
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
