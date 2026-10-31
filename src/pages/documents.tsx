import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search as SearchIcon,
  Download,
  CheckCircle2,
  FileText as FileIcon,
  Lock,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRbac } from "@/lib/rbac";
import { useStore, type Document } from "@/lib/store";
import { formatDate } from "@/lib/format";

const categories: Document["category"][] = ["Policy", "Contract", "Intern", "Finance", "Template", "Report"];

function UploadDialog({ roleOptions }: { roleOptions: { id: string; name: string }[] }) {
  const { addDocument } = useStore();
  const { currentUser } = useRbac();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Document["category"]>("Policy");
  const [access, setAccess] = useState<string[]>(["admin", "hr"]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="size-4" animateOnHover /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addDocument({
              name: name.trim(),
              category,
              owner: currentUser.name,
              accessRoles: access.length ? access : ["admin"],
              status: "Pending",
              version: "v1.0",
              updated: "2026-10-31",
              sizeKb: 200 + Math.round(Math.random() * 1800),
            });
            setName("");
            setOpen(false);
            toast.success("Document uploaded for review");
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="doc-name">Document name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Remote Work Policy" required />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Document["category"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Who can access</Label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((r) => (
                <Label key={r.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm font-normal">
                  <Checkbox
                    checked={access.includes(r.id)}
                    onCheckedChange={(v) =>
                      setAccess((prev) => (v ? [...new Set([...prev, r.id])] : prev.filter((x) => x !== r.id)))
                    }
                  />
                  {r.name}
                </Label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const { documents, updateDocument } = useStore();
  const { can, currentRole, roles } = useRbac();
  const canManage = can("documents:manage");
  const canUpload = can("documents:upload");

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const roleOptions = roles.map((r) => ({ id: r.id, name: r.name }));
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;

  // Role-aware visibility: managers see everything, others only what their role can access.
  const visible = useMemo(
    () => (canManage ? documents : documents.filter((d) => d.accessRoles.includes(currentRole.id))),
    [documents, canManage, currentRole.id],
  );

  const filtered = useMemo(
    () =>
      visible.filter((d) => {
        const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase());
        const matchesCat = cat === "all" || d.category === cat;
        return matchesQuery && matchesCat;
      }),
    [visible, query, cat],
  );

  const approved = visible.filter((d) => d.status === "Approved").length;
  const pending = visible.filter((d) => d.status === "Pending").length;
  const expired = visible.filter((d) => d.status === "Expired").length;

  return (
    <>
      <PageHeader
        title="Documents"
        description="Company and people documents with role-based access, versions and approvals."
      >
        {!canManage && (
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5" /> Showing docs for {currentRole.name}
          </Badge>
        )}
        {canUpload && <UploadDialog roleOptions={roleOptions} />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={visible.length} tone="primary" icon={<FileText className="size-5" animateOnHover />} />
        <StatCard label="Approved" value={approved} tone="success" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Pending review" value={pending} tone="warning" />
        <StatCard label="Expired" value={expired} tone="danger" />
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Owner</TableHead>
                <TableHead className="hidden xl:table-cell">Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileIcon className="size-4" />
                      </span>
                      <div>
                        <div className="text-sm font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.version} · {(d.sizeKb / 1024).toFixed(1)} MB</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="font-normal">{d.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{d.owner}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {d.accessRoles.length >= roles.length ? (
                        <Badge variant="outline" className="font-normal">Everyone</Badge>
                      ) : (
                        <>
                          {d.accessRoles.slice(0, 2).map((r) => (
                            <Badge key={r} variant="outline" className="font-normal">{roleName(r)}</Badge>
                          ))}
                          {d.accessRoles.length > 2 && (
                            <Badge variant="outline" className="font-normal">+{d.accessRoles.length - 2}</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(d.updated)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{d.name}</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => toast(`Downloading ${d.name}`)}>
                          <Download className="size-4" /> Download
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={d.status === "Approved"}
                              onSelect={() => { updateDocument(d.id, { status: "Approved" }); toast.success(`Approved ${d.name}`); }}
                            >
                              <CheckCircle2 className="size-4" /> Approve
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <Lock className="mx-auto mb-2 size-5" />
                    No documents available for your role or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
