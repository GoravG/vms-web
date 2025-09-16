import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CONNECTION_PHASES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECEIVING: 'receiving',
  ERROR: 'error'
};

export default function Home() {
  const [qrUrl, setQrUrl] = useState('');
  const [message, setMessage] = useState('');
  const [connectionPhase, setConnectionPhase] = useState(CONNECTION_PHASES.DISCONNECTED);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  // establish websocket connection and handle reconnects
  useEffect(() => {
    let mounted = true;

    function connect() {
      setConnectionPhase(CONNECTION_PHASES.CONNECTING);
      const ws = new WebSocket('ws://localhost:8080/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('ws open');
        if (mounted) {
          toast("Connected", {
            description: "Successfully connected to server",
          })
          setConnectionPhase(CONNECTION_PHASES.CONNECTED);
        }
      };

      ws.onmessage = (e) => {
        const data = typeof e.data === 'string' ? e.data : '';
        if (!mounted) return;
        setMessage(data);
        setConnectionPhase(CONNECTION_PHASES.RECEIVING);
      };

      ws.onerror = (err) => {
        console.error('ws error', err);
        if (mounted) {
          setConnectionPhase(CONNECTION_PHASES.ERROR);
        }
      };

      ws.onclose = (ev) => {
        console.log('ws closed', ev.code, ev.reason);
        if (!mounted) return;
        setConnectionPhase(CONNECTION_PHASES.DISCONNECTED);
        reconnectRef.current = setTimeout(() => connect(), 2000);
      };
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // generate QR whenever message changes
  useEffect(() => {
    if (!message) {
      setQrUrl('');
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(message, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((url) => { if (!cancelled) setQrUrl(url); })
      .catch((err) => { console.error('qr gen error', err); });

    return () => { cancelled = true; };
  }, [message]);

  const getStatusConfig = () => {
    switch (connectionPhase) {
      case CONNECTION_PHASES.RECEIVING:
        return {
          color: 'bg-emerald-500',
          animation: 'animate-pulse',
          variant: 'default'
        };
      case CONNECTION_PHASES.CONNECTED:
        return {
          color: 'bg-blue-500',
          animation: '',
          variant: 'secondary'
        };
      case CONNECTION_PHASES.CONNECTING:
        return {
          color: 'bg-amber-500',
          animation: 'animate-pulse',
          variant: 'outline',
        };
      case CONNECTION_PHASES.ERROR:
        return {
          color: 'bg-red-500',
          animation: '',
          variant: 'destructive',
          text: 'Error'
        };
      default:
        return {
          color: 'bg-gray-400',
          animation: '',
          variant: 'outline'
        };
    }
  };

  const status = getStatusConfig();

  return (
    <>
      <Head>
        <title>VMS-QR</title>
        <meta name="description" content="Live QR Code Generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Floating orbs for visual interest */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="w-full max-w-lg mx-auto relative z-10">
          <Card className="border-0 shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${status.color} ${status.animation} transition-all duration-500`}></div>
                  <div className={`absolute inset-0 w-4 h-4 rounded-full ${status.color} opacity-25 animate-ping`}></div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-8">
              {/* QR Code Display */}
              <div className="flex justify-center mb-8">
                {qrUrl ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
                    <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                      <Image
                        src={qrUrl}
                        alt="QR Code"
                        width={280}
                        height={280}
                        className="rounded-xl"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-[312px] h-[312px] flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="text-center space-y-4">
                      {connectionPhase === CONNECTION_PHASES.CONNECTING ? (
                        <>
                          <div className="relative mx-auto w-12 h-12">
                            <div className="absolute inset-0 w-12 h-12 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Connecting</p>
                        </>
                      ) : (
                        <>
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Waiting for data</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Display */}
              {message && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                    {/* <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</span> */}
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                  </div>
                  <div className="relative">
                    <pre className="text-sm bg-slate-100/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono overflow-x-auto whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">
                      {message}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="text-center pt-6 border-t border-slate-100 dark:border-slate-800">
            </CardFooter>
          </Card>
        </div>
        <Toaster />
      </main>
    </>
  );
}