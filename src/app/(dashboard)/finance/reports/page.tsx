"use client";

import { useState } from "react";
import { 
  Download, 
  Search, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  FileText, 
  Landmark,
  ShieldCheck,
  TrendingUp,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getFinancialReports } from "@/features/finance/actions/report-actions";

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [dates, setDates] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const generateReport = async () => {
    try {
      setLoading(true);
      const data = await getFinancialReports(dates.start, dates.end);
      setReports(data || []);
      toast.success("Rapport généré", { description: "Les données du Ledger ont été consolidées." });
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de récupérer les données financières." });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (reports.length === 0) return;
    
    const headers = ["Date", "Nombre d'écritures", "Montant Total (FCFA)", "Détails types"];
    const csvContent = [
      headers.join(","),
      ...reports.map(r => [
        r.day,
        r.total_entries,
        r.total_amount,
        JSON.stringify(r.entry_types || {}).replace(/,/g, ';')
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_finance_${dates.start}_au_${dates.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export réussi", { description: "Fichier CSV téléchargé." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Rapports <span className="text-primary">Financiers</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Consueltez et exportez les écritures auditées du Grand Livre immuable.
          </p>
        </div>
        <div className="flex gap-3">
           <Button 
            variant="outline" 
            className="rounded-2xl border-gray-200 font-bold gap-2 h-12"
            onClick={exportCSV}
            disabled={reports.length === 0}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Selecteur de période */}
      <Card className="p-8 rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Date de début</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="date" 
                value={dates.start}
                onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
                className="rounded-xl border-gray-100 h-12 pl-10 focus:ring-primary/20" 
              />
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Date de fin</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="date" 
                value={dates.end}
                onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
                className="rounded-xl border-gray-100 h-12 pl-10 focus:ring-primary/20" 
              />
            </div>
          </div>
          <Button 
            onClick={generateReport}
            className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-orange-100 gap-2 shrink-0"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
            ) : (
              <Filter className="w-4 h-4" />
            )}
            Générer le rapport
          </Button>
        </div>
      </Card>

      {/* Résultats */}
      <Card className="rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-50">
                <TableHead className="w-[180px] font-bold text-gray-400 py-4 pl-8 uppercase text-xs tracking-widest">Date</TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Écritures</TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Types d'opérations</TableHead>
                <TableHead className="text-right font-bold text-gray-400 py-4 pr-8 uppercase text-xs tracking-widest">Montant Consolidé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Audit du Ledger en cours...</p>
                      </div>
                   </TableCell>
                 </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-32">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-gray-900 text-xl tracking-tight uppercase">Aucune donnée</p>
                        <p className="text-gray-400 font-medium">Sélectionnez une période et cliquez sur "Générer".</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
                    <TableCell className="font-black text-gray-900 py-6 pl-8">
                       {new Date(report.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-bold text-gray-500">
                      <Badge variant="outline" className="rounded-lg bg-gray-50 border-gray-100">{report.total_entries} entrées</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(report.entry_types || {}).map(([type, count]: any) => (
                          <Badge key={type} className="rounded-lg bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase tracking-wider">
                            {type}: {count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <span className="text-xl font-black text-gray-900">{Number(report.total_amount).toLocaleString()}</span>
                       <span className="ml-1 text-[10px] font-bold text-gray-400">FCFA</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
