import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Database, 
  Download, 
  HelpCircle, 
  Play, 
  RefreshCw, 
  Search, 
  Table as TableIcon,
  Terminal,
  Zap
} from 'lucide-react';
import { PREBUILT_SQL_QUERIES } from '../../data/mockData';
import { executeSQL, SQLQueryResult } from '../../utils/sqlEngine';
import { downloadCSV } from '../../utils/exportUtils';

export const SQLWorkbench: React.FC = () => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>(PREBUILT_SQL_QUERIES[0].id);
  const [sqlText, setSqlText] = useState<string>(PREBUILT_SQL_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<SQLQueryResult>(() => executeSQL(PREBUILT_SQL_QUERIES[0].sql));
  const [copied, setCopied] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [activeSchemaTable, setActiveSchemaTable] = useState<string>('shipments');

  const selectedQueryMeta = PREBUILT_SQL_QUERIES.find(q => q.id === selectedQueryId);

  const handleSelectPrebuilt = (queryId: string) => {
    const q = PREBUILT_SQL_QUERIES.find(item => item.id === queryId);
    if (q) {
      setSelectedQueryId(q.id);
      setSqlText(q.sql);
      const res = executeSQL(q.sql);
      setQueryResult(res);
      setTableSearch('');
    }
  };

  const handleRunQuery = () => {
    const res = executeSQL(sqlText);
    setQueryResult(res);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportResults = () => {
    if (queryResult.rows.length > 0) {
      downloadCSV(queryResult.rows, `sql_results_${selectedQueryId}`);
    }
  };

  // Filter rows by quick search
  const displayedRows = queryResult.rows.filter(row => {
    if (!tableSearch) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Workbench Header & Description */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Supply Chain SQL Analytics Workbench
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Execute analytical SQL queries against normalized supply chain data tables (<code className="font-mono text-slate-700">shipments</code>, <code className="font-mono text-slate-700">suppliers</code>, <code className="font-mono text-slate-700">warehouses</code>, <code className="font-mono text-slate-700">carriers</code>). Inspect bottlenecks, calculate OTIF reliability, and isolate cost drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">SQLite / ANSI SQL Engine</span>
          </div>
        </div>

        {/* Prebuilt Analyst Queries Selection */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Select Analyst Investigation Query:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PREBUILT_SQL_QUERIES.map(q => {
              const isSelected = selectedQueryId === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectPrebuilt(q.id)}
                  className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 truncate pr-2">{q.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 px-1.5 py-0.5 bg-slate-100 rounded">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workbench Layout: Schema on Left (3 cols), Editor & Results on Right (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schema Explorer */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <TableIcon className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Data Schema Explorer
            </h3>
          </div>

          <div className="space-y-1 mb-4">
            {[
              { id: 'shipments', name: 'shipments', count: 640, desc: 'Core transaction records' },
              { id: 'suppliers', name: 'suppliers', count: 12, desc: 'Vendor SLAs & ratings' },
              { id: 'warehouses', name: 'warehouses', count: 8, desc: 'Global fulfillment hubs' },
              { id: 'carriers', name: 'carriers', count: 7, desc: 'Freight providers & rates' },
            ].map(tbl => (
              <button
                key={tbl.id}
                onClick={() => setActiveSchemaTable(tbl.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeSchemaTable === tbl.id 
                    ? 'bg-slate-900 text-white font-medium' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="font-mono">{tbl.name}</span>
                  <span className={`block text-[10px] ${activeSchemaTable === tbl.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {tbl.desc}
                  </span>
                </div>
                <span className={`font-mono tabular-nums text-[11px] ${activeSchemaTable === tbl.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {tbl.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Table Columns */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {activeSchemaTable} Schema
            </span>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto text-xs pr-1">
              {activeSchemaTable === 'shipments' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800 font-semibold">id</span>
                    <span className="text-slate-400">VARCHAR (PK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">carrierId</span>
                    <span className="text-slate-400">VARCHAR (FK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">supplierId</span>
                    <span className="text-slate-400">VARCHAR (FK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">originWarehouseId</span>
                    <span className="text-slate-400">VARCHAR (FK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">destinationRegion</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">transportMode</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">freightCost</span>
                    <span className="text-slate-400">DECIMAL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">weightKg</span>
                    <span className="text-slate-400">INTEGER</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">status</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">delayHours</span>
                    <span className="text-slate-400">INTEGER</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">delayReason</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">warehouseProcessingHours</span>
                    <span className="text-slate-400">DECIMAL</span>
                  </div>
                  <div className="flex justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-800">transitDays</span>
                    <span className="text-slate-400">INTEGER</span>
                  </div>
                </>
              )}

              {activeSchemaTable === 'suppliers' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800 font-semibold">id</span>
                    <span className="text-slate-400">VARCHAR (PK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">name</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">country / region</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">category</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">contractValue</span>
                    <span className="text-slate-400">DECIMAL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">onTimeRate</span>
                    <span className="text-slate-400">DECIMAL (%)</span>
                  </div>
                  <div className="flex justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-800">defectRate</span>
                    <span className="text-slate-400">DECIMAL (%)</span>
                  </div>
                </>
              )}

              {activeSchemaTable === 'warehouses' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800 font-semibold">id</span>
                    <span className="text-slate-400">VARCHAR (PK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">name / code</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">region / city</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">avgDispatchHours</span>
                    <span className="text-slate-400">DECIMAL</span>
                  </div>
                  <div className="flex justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-800">activeBottleneck</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                </>
              )}

              {activeSchemaTable === 'carriers' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800 font-semibold">id</span>
                    <span className="text-slate-400">VARCHAR (PK)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">name</span>
                    <span className="text-slate-400">VARCHAR</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 font-mono text-[11px]">
                    <span className="text-slate-800">avgCostPerKg</span>
                    <span className="text-slate-400">DECIMAL</span>
                  </div>
                  <div className="flex justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-800">reliabilityScore</span>
                    <span className="text-slate-400">DECIMAL (%)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SQL Code Editor & Query Result Table */}
        <div className="lg:col-span-9 space-y-4">
          {/* SQL Editor Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-medium">SQL Query Console</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySQL}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleRunQuery}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Query</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="p-3">
              <textarea
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                rows={9}
                className="w-full bg-transparent font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Results Container */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Query Results
                </span>
                
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {queryResult.rowCount} rows returned · {queryResult.executionTimeMs}ms
                </span>

                {queryResult.error ? (
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Query Error
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Execution OK
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter results..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <button
                  onClick={handleExportResults}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {queryResult.error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-mono">
                {queryResult.error}
              </div>
            )}

            {/* Tabular Output */}
            {!queryResult.error && (
              <div className="mt-3 overflow-x-auto max-h-[380px] border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-medium z-10">
                    <tr>
                      {queryResult.columns.map(col => (
                        <th key={col} className="py-2 px-3 font-mono text-[11px] font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {displayedRows.length === 0 ? (
                      <tr>
                        <td colSpan={queryResult.columns.length} className="py-8 text-center text-slate-400 text-xs">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          {queryResult.columns.map(col => {
                            const val = row[col];
                            const isNumeric = typeof val === 'number' || (typeof val === 'string' && (/^[\$0-9%.,\s-a-zA-Z]+$/).test(val) && (val.includes('%') || val.includes('$') || val.includes('hrs') || val.includes('days') || val.includes('kg')));

                            return (
                              <td 
                                key={col} 
                                className={`py-2 px-3 whitespace-nowrap text-slate-800 ${
                                  isNumeric ? 'font-mono tabular-nums text-slate-900' : ''
                                }`}
                              >
                                {val !== null && val !== undefined ? String(val) : <span className="text-slate-300">NULL</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
