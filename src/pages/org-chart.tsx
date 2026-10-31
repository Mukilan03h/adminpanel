import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/format";

type Node = {
  name: string;
  role: string;
  hue: number;
  reports?: string;
  children: Node[];
};

function PersonCard({ node, root = false }: { node: Node; root?: boolean }) {
  return (
    <Card className={cn("w-64 py-0 shadow-sm", root && "border-primary/40")}>
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${node.hue}), oklch(0.55 0.2 ${node.hue}))` }}
        >
          {initials(node.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{node.name}</div>
          <div className="truncate text-xs text-muted-foreground">{node.role}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Vertical tree with guide lines — clear hierarchy that works in both themes. */
function TreeNode({ node, root = false }: { node: Node; root?: boolean }) {
  return (
    <li className={cn("relative", !root && "ml-6 pl-6")}>
      {!root && (
        <>
          {/* horizontal connector */}
          <span className="absolute top-5 left-0 h-px w-6 bg-border" />
        </>
      )}
      <div className="py-1.5">
        <PersonCard node={node} root={root} />
      </div>
      {node.children.length > 0 && (
        <ul className="relative">
          {/* vertical connector spanning children */}
          <span className="absolute top-0 bottom-5 left-0 w-px bg-border" />
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
        .map((i) => ({ name: i.name, role: `Intern · ${i.department}`, hue: i.hue, reports: mentor, children: [] }));

    return {
      name: "Ananya Rao",
      role: "Administrator",
      hue: 262,
      children: [
        { name: "Priya Nair", role: "HR Manager", hue: 280, children: [] },
        {
          name: "Rahul Mehta",
          role: "Project Manager",
          hue: 200,
          children: [
            {
              name: "Sneha Iyer",
              role: "Team Lead",
              hue: 150,
              children: internsFor("Sneha Iyer"),
            },
            {
              name: "Vikram Singh",
              role: "Software Engineer",
              hue: 240,
              children: internsFor("Vikram Singh"),
            },
            {
              name: "Aditi Rao",
              role: "Software Engineer",
              hue: 320,
              children: internsFor("Rahul Mehta"),
            },
          ],
        },
      ],
    };
  }, [interns]);

  const counts = useMemo(() => {
    let people = 0;
    const walk = (n: Node) => {
      people++;
      n.children.forEach(walk);
    };
    walk(tree);
    return people;
  }, [tree]);

  return (
    <>
      <PageHeader
        title="Organization Chart"
        description="Reporting structure across leadership, teams and interns (interns report to their mentors / team leads)."
      >
        <Badge variant="secondary">{counts} people</Badge>
      </PageHeader>

      <Card>
        <CardContent className="overflow-x-auto py-6">
          <ul>
            <TreeNode node={tree} root />
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
