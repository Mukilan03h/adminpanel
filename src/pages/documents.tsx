import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Search as SearchIcon,
  Download,
  CheckCircle2,
  FileText as FileIcon,
  Link2,
  Lock,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Upload,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function sizeLabel(kb: number): string {
  if (!kb) return "—";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function openDoc(doc: Document) {
  if (doc.source === "link") {
    window.open(doc.url, "_blank", "noopener,noreferrer");
  } else if (doc.__blobUrl) {
    window.open(doc.__blobUrl, "_blank", "noopener,noreferrer");
  } else {
    toast(`Opening ${doc.name} (${doc.fileType})`, { description: "Preview is a demo placeholder." });
  }
}

function UploadDialog({
  roleOptions,
  canAssign,
}: {
  roleOptions: { id: string; name: string }[];
  canAssign: boolean;
}) {
  const { addDocument } = useStore();
  const { currentUser } = useRbac();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Document["category"]>("Policy");
  const [access, setAccess] = useState<string[]>(["admin", "hr"]);
  const [url, setUrl] = useState("");
  const [assigned, setAssigned] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setName("");
    setUrl("");
    setAssigned("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="size-4" animateOnHover /> Add document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a document</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "file" | "link")}>
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1"><Upload className="size-4" /> Upload file</TabsTrigger>
            <TabsTrigger value="link" className="flex-1"><Link2 className="size-4" /> Add link</TabsTrigger>
          </TabsList>

          <form
            className="grid gap-4 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              let fileType = "Link";
              let sizeKb = 0;
              let docUrl = url;
              let blobUrl: string | undefined;
              let source: Document["source"] = "link";
              if (mode === "file") {
                if (!file) {
                  toast.error("Choose a file to upload");
                  return;
                }
                source = "file";
                fileType = (file.name.split(".").pop() || "FILE").toUpperCase();
                sizeKb = Math.max(1, Math.round(file.size / 1024));
                blobUrl = URL.createObjectURL(file);
                docUrl = blobUrl;
              } else if (!url.trim()) {
                toast.error("Enter a URL");
                return;
              }
              addDocument({
                name: name.trim() || (file ? file.name : "Untitled"),
                category,
                owner: currentUser.name,
                accessRoles: access.length ? access : ["admin"],
                status: "Pending",
                version: "v1.0",
                updated: "2026-10-31",
                sizeKb,
                source,
                fileType,
                url: docUrl,
                assignedTo: assigned ? assigned.split(",").map((s) => s.trim()).filter(Boolean) : [],
                __blobUrl: blobUrl,
              });
              setOpen(false);
              reset();
              toast.success("Document added");
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="doc-name">Name</Label>
              <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Remote Work Policy" />
            </div>

            <TabsContent value="file" className="m-0 grid gap-2">
              <Label htmlFor="doc-file">File</Label>
              <Input
                id="doc-file" ref={fileRef} type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
                }}
              />
              {file && <p className="text-xs text-muted-foreground">{file.name} · {sizeLabel(Math.round(file.size / 1024))}</p>}
            </TabsContent>

            <TabsContent value="link" className="m-0 grid gap-2">
              <Label htmlFor="doc-url">URL</Label>
              <Input id="doc-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </TabsContent>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Document["category"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {canAssign && (
                <div className="grid gap-2">
                  <Label>Assign to</Label>
                  <Input value={assigned} onChange={(e) => setAssigned(e.target.value)} placeholder="Names / teams" />
                </div>
              )}
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
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ doc }: { doc: Document }) {
  const { updateDocument } = useStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(doc.assignedTo.join(", "));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserCheck className="size-4" /> Assign
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign “{doc.name}”</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label>Assigned to (comma-separated)</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ishaan Gupta, Engineering" />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button
            onClick={() => {
              updateDocument(doc.id, { assignedTo: value.split(",").map((s) => s.trim()).filter(Boolean) });
              setOpen(false);
              toast.success("Assignment updated");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const { documents, updateDocument } = useStore();
  const { can, currentRole, roles } = useRbac();
  const canManage = can("documents:manage");
  const canUpload = can("documents:upload");
  const isSuperadmin = currentRole.permissions.includes("*");

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const roleOptions = roles.map((r) => ({ id: r.id, name: r.name }));
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;

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
  const links = visible.filter((d) => d.source === "link").length;
  const pending = visible.filter((d) => d.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="Documents"
        description="Company and people documents — upload files or add links, with role-based access and Superadmin assignment."
      >
        {!canManage && (
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5" /> Showing docs for {currentRole.name}
          </Badge>
        )}
        {canUpload && <UploadDialog roleOptions={roleOptions} canAssign={isSuperadmin} />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={visible.length} tone="primary" icon={<FileText className="size-5" animateOnHover />} />
        <StatCard label="Approved" value={approved} tone="success" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Links" value={links} tone="info" icon={<Link2 className="size-5" />} />
        <StatCard label="Pending review" value={pending} tone="warning" />
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
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden xl:table-cell">Assigned to</TableHead>
                <TableHead className="hidden lg:table-cell">Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right">Open</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className={`flex size-9 items-center justify-center rounded-lg ${d.source === "link" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                        {d.source === "link" ? <Link2 className="size-4" /> : <FileIcon className="size-4" />}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.version} · {sizeLabel(d.sizeKb)} · {formatDate(d.updated)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="font-normal">{d.fileType}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="font-normal">{d.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {d.assignedTo.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        d.assignedTo.slice(0, 2).map((a) => (
                          <Badge key={a} variant="outline" className="font-normal">{a}</Badge>
                        ))
                      )}
                      {d.assignedTo.length > 2 && <Badge variant="outline">+{d.assignedTo.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {d.accessRoles.length >= roles.length ? (
                        <Badge variant="outline" className="font-normal">Everyone</Badge>
                      ) : (
                        d.accessRoles.slice(0, 2).map((r) => (
                          <Badge key={r} variant="outline" className="font-normal">{roleName(r)}</Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openDoc(d)} aria-label="Open">
                      <ExternalLink className="size-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="max-w-48 truncate">{d.name}</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => openDoc(d)}>
                          {d.source === "link" ? <ExternalLink className="size-4" /> : <Download className="size-4" />}
                          {d.source === "link" ? "Open link" : "Open / download"}
                        </DropdownMenuItem>
                        {isSuperadmin && <AssignDialog doc={d} />}
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
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
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
