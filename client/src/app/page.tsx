'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';

interface FailedJob {
  jobId: string;
  reason: string;
}

interface ImportLog {
  _id?: string;
  fileName: string;
  importDateTime: string;
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  totalImported: number;
  failedJobs: FailedJob[];
}

let socket: Socket | null = null;

export default function ImportLogsPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<FailedJob[] | null>(null);

  
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/import-history?page=${page}&limit=${limit}`);
        const json = await res.json();

        setLogs(json.data);
        setTotalPages(json.pagination.totalPages);
      } catch (err) {
        console.error('Failed to load logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('job-progress', (newLog: ImportLog) => {
      console.log('Job Progress Received', newLog);
      fetchLogs();
    });

    return () => {
      socket?.disconnect();
    };
  }, [page, limit]);

  const openModal = (failedJobs: FailedJob[]) => {
    setSelectedLog(failedJobs);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  if (loading) return <p className="flex h-screen justify-center items-center text-xl font-extrabold">Loading ...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-blue-700 bg-white text-center">
        Scalable Job Importer with Queue Processing & History Tracking
      </h1>
      <h3 className="text-2xl font-bold mb-4 text-center">Import History Logs</h3>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-50 text-green-500">
          <tr>
            <th className="p-2 border">fileName</th>
            <th className="p-2 border">TimeStamp</th>
            <th className="p-2 border">TotalFetch</th>
            <th className="p-2 border">Imported</th>
            <th className="p-2 border">New</th>
            <th className="p-2 border">Updated</th>
            <th className="p-2 border">Failed</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log._id || index} className="text-center">
              <td className="p-2 border">{log.fileName}</td>
              <td className="p-2 border">{new Date(log.importDateTime).toLocaleString()}</td>
              <td className="p-2 border">{log.totalFetched}</td>
              <td className="p-2 border">{log.totalImported}</td>
              <td className="p-2 border">{log.newJobs}</td>
              <td className="p-2 border">{log.updatedJobs}</td>
              <td className="p-2 border flex items-center justify-center gap-2 mx-auto">
                <span>{log.failedJobs.length}</span>
                <button onClick={() => openModal(log.failedJobs)}>
                  <Image
                    src="/error.png"
                    alt="Failed jobs"
                    width={20}
                    height={20}
                    style={{ filter: 'grayscale(1) invert(30%) sepia(70%) hue-rotate(350deg) saturate(500%) brightness(80%)' }}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="self-center">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {selectedLog !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center text-black">Failed Jobs</h2>
            {selectedLog.length === 0 ? (
              <p className="text-center text-gray-600">No data available</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto text-sm space-y-3">
                {selectedLog.map((job, idx) => (
                  <li key={idx} className="border-b pb-2">
                    <strong>Job ID:</strong> {job.jobId}
                    <br />
                    <strong>Reason:</strong> {job.reason}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 text-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
