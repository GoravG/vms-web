import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Wifi, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

    const baseURL = process.env.NEXT_PUBLIC_BASE_URL

    function connect() {
      setConnectionPhase(CONNECTION_PHASES.CONNECTING);
      const wsURL = `ws://${baseURL}/ws`
      console.log(wsURL)
      const ws = new WebSocket(wsURL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('ws open');
        if (mounted) {
          toast.success("Connected to server");
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
          toast.error("Connection error");
          setConnectionPhase(CONNECTION_PHASES.ERROR);
        }
      };

      ws.onclose = (ev) => {
        console.log('ws closed', ev.code, ev.reason);
        if (!mounted) return;
        setConnectionPhase(CONNECTION_PHASES.DISCONNECTED);
        toast.warning("Disconnected, reconnecting...");
        reconnectRef.current = setTimeout(() => connect(), 5000);
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
    console.log(message)

    let cancelled = false;

    QRCode.toDataURL(message, {
      width: 256,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff'
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
          variant: 'default',
          icon: CheckCircle2,
          label: 'Active',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case CONNECTION_PHASES.CONNECTED:
        return {
          variant: 'secondary',
          icon: Wifi,
          label: 'Connected',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case CONNECTION_PHASES.CONNECTING:
        return {
          variant: 'outline',
          icon: Loader2,
          label: 'Connecting',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case CONNECTION_PHASES.ERROR:
        return {
          variant: 'destructive',
          icon: AlertCircle,
          label: 'Error',
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          variant: 'outline',
          icon: Loader2,
          label: 'Disconnected',
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <>
      <Head>
        <title>QR Live</title>
        <meta name="description" content="Live QR Code Generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`min-h-screen bg-gray-50/30 ${geistSans.variable} ${geistMono.variable} font-sans flex flex-col items-center justify-center p-6`}>
        <div className="w-full max-w-md mx-auto space-y-6">

          <div className="w-full">
            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4 px-8 pt-8">
                <div className="flex items-center justify-between">
                  {/* <CardTitle className="text-lg font-medium">QR Code</CardTitle> */}
                  &nbsp;<Badge className={status.className} variant={status.variant}>
                    <StatusIcon
                      className={`w-3 h-3 mr-1.5 ${connectionPhase === CONNECTION_PHASES.CONNECTING ? 'animate-spin' : ''
                        }`}
                    />
                    &nbsp;{status.label} &nbsp;
                  </Badge>
                </div>
              </CardHeader>

              <CardContent style={{ paddingBottom: 70 }}>
                {/* QR Code Display */}
                <div className="flex justify-center">
                  {qrUrl ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <Image
                        src={qrUrl}
                        alt="QR Code"
                        width={256}
                        height={256}
                        priority
                        className="rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-[280px] h-[280px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-gray-200 border-dashed">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <StatusIcon
                          className={`w-6 h-6 text-gray-500 ${connectionPhase === CONNECTION_PHASES.CONNECTING ||
                            connectionPhase === CONNECTION_PHASES.DISCONNECTED
                            ? 'animate-spin'
                            : ''
                            }`}
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-500 font-medium">
                        {connectionPhase === CONNECTION_PHASES.CONNECTING
                          ? 'Connecting...'
                          : 'Waiting for data'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }
          }}
        />
      </main >
    </>
  );
}