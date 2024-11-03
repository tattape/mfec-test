'use client'

import axios from "axios";
import { useState } from "react";

type Message = {
  text: string;
  status: string;
}

export default function Home() {
  const [Messages, setMessages] = useState<Message[]>([])
  const [Loading, setLoading] = useState(false)

  const GenerateWords = async () => {
    setMessages((prev) => [...prev, { text: '========== start generate words folder ==========', status: 'Normal' }]);
    try {
      const response = await axios.post('/api/generateWords');
      const data = await response.data;
      setMessages((prev) => [...prev, { text: data.message, status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  }

  const GenerateWordsSizeReport = async () => {
    setMessages((prev) => [...prev, { text: '========== start generate words size report ==========', status: 'Normal' }]);
    try {
      const response = await axios.get('/api/generateWordsSizeReport', { responseType: 'blob' }); // เปลี่ยน responseType เป็น blob
      const url = window.URL.createObjectURL(new Blob([response.data])); // สร้าง URL จาก Blob
      const link = document.createElement('a'); // สร้าง anchor element
      link.href = url; // ตั้งค่าลิงค์ให้ไปที่ Blob URL
      link.setAttribute('download', 'words_size_report.pdf'); // ตั้งชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(link); // เพิ่มลิงค์ไปยัง DOM
      link.click(); // คลิกเพื่อดาวน์โหลด
      link.remove(); // ลบลิงค์หลังจากดาวน์โหลด
      window.URL.revokeObjectURL(url); // ลบ Blob URL
      setMessages((prev) => [...prev, { text: 'Size Report Created Successfully!', status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  }

  const ZipWords = async () => {
    setMessages((prev) => [...prev, { text: '========== start zipping words ==========', status: 'Normal' }]);
    try {
      const response = await axios.post('/api/generateZipWords');
      const data = await response.data;
      setMessages((prev) => [...prev, { text: data.message, status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  };

  const GenerateCompressionReport = async () => {
    setMessages((prev) => [...prev, { text: '========== start generate compression report ==========', status: 'Normal' }]);
    try {
      const response = await axios.get('/api/generateCompressionReport', { responseType: 'blob' }); // เปลี่ยน responseType เป็น blob
      const url = window.URL.createObjectURL(new Blob([response.data])); // สร้าง URL จาก Blob
      const link = document.createElement('a'); // สร้าง anchor element
      link.href = url; // ตั้งค่าลิงค์ให้ไปที่ Blob URL
      link.setAttribute('download', 'compression_report.pdf'); // ตั้งชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(link); // เพิ่มลิงค์ไปยัง DOM
      link.click(); // คลิกเพื่อดาวน์โหลด
      link.remove(); // ลบลิงค์หลังจากดาวน์โหลด
      window.URL.revokeObjectURL(url); // ลบ Blob URL
      setMessages((prev) => [...prev, { text: 'Compression Report Created Successfully!', status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  }

  const InsertToDB = async () => {
    setMessages((prev) => [...prev, { text: '========== start insert words to DB ==========', status: 'Normal' }]);
    try {
      const response = await axios.post('/api/uploadWord');
      const data = await response.data;
      setMessages((prev) => [...prev, { text: data.message, status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  };

  const QueryFromDB = async () => {
    setMessages((prev) => [...prev, { text: '========== start generate query report ==========', status: 'Normal' }]);
    try {
      const response = await axios.get('/api/queryFromDB', { responseType: 'blob' }); // เปลี่ยน responseType เป็น blob
      const url = window.URL.createObjectURL(new Blob([response.data])); // สร้าง URL จาก Blob
      const link = document.createElement('a'); // สร้าง anchor element
      link.href = url; // ตั้งค่าลิงค์ให้ไปที่ Blob URL
      link.setAttribute('download', 'query_report.pdf'); // ตั้งชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(link); // เพิ่มลิงค์ไปยัง DOM
      link.click(); // คลิกเพื่อดาวน์โหลด
      link.remove(); // ลบลิงค์หลังจากดาวน์โหลด
      window.URL.revokeObjectURL(url); // ลบ Blob URL
      setMessages((prev) => [...prev, { text: 'Query Report Created Successfully!', status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  }

  const ExportWordFromDB = async () => {
    setMessages((prev) => [...prev, { text: '========== start export words from DB ==========', status: 'Normal' }]);
    try {
      const response = await axios.get('/api/exportWord', { responseType: 'blob' }); // เปลี่ยน responseType เป็น blob
      const url = window.URL.createObjectURL(new Blob([response.data])); // สร้าง URL จาก Blob
      const link = document.createElement('a'); // สร้าง anchor element
      link.href = url; // ตั้งค่าลิงค์ให้ไปที่ Blob URL
      link.setAttribute('download', 'words.pdf'); // ตั้งชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(link); // เพิ่มลิงค์ไปยัง DOM
      link.click(); // คลิกเพื่อดาวน์โหลด
      link.remove(); // ลบลิงค์หลังจากดาวน์โหลด
      window.URL.revokeObjectURL(url); // ลบ Blob URL
      setMessages((prev) => [...prev, { text: 'Word Exported Successfully!', status: 'OK' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: err instanceof Error ? err.message : 'Unknown error', status: 'ERROR' }]);
    }
  };


  const onStartProcess = async () => {
    setLoading(true)
    setMessages([])
    if (!Loading) {
      await GenerateWords();
      await GenerateWordsSizeReport();
      await ZipWords();
      await GenerateCompressionReport();
      await InsertToDB();
      await QueryFromDB();
      await ExportWordFromDB();
      setLoading(false)
    }
    return
  }

  return (
    <div className="bg-[url('/imgs/BG.jpg')] bg-cover h-screen flex flex-col items-center justify-center px-20 lg:px-40 gap-5 lg:gap-10">
      <button
        onClick={onStartProcess}
        type="button"
        disabled={Loading}
        className={`text-white text-lg bg-gradient-to-r ${Loading ? 'from-slate-400  via-slate-500 to-slate-600' : 'from-purple-400  via-purple-500 to-purple-600'} hover:bg-gradient-to-br font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2`}>
        {Loading ? 'Processing' : 'Start Process'}
      </button>
      <div className="relative bg-slate-500 bg-opacity-30 backdrop-blur-lg shadow-lg rounded-xl h-[600px] overflow-auto w-full flex flex-col p-5">
        {Messages.map((message, idx) => (
          <span className={message.status === 'OK' ? 'text-green-500' : message.status === 'ERROR' ? 'text-red-700' : 'text-white'} key={idx}>{message.text}</span>
        ))}
        {Loading &&
          <span className="text-orange-400 animate-pulse">Loading . . .</span>
        }
      </div>
    </div >
  );
}
