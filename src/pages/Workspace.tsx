import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Stage, Layer, Line } from 'react-konva';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Edit3, PenTool, Eraser, Trash2, Users, Loader2 } from 'lucide-react';

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'document' | 'whiteboard'>('document');
  
  // Document State
  const [documentContent, setDocumentContent] = useState('');
  
  // Whiteboard State
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect to WebSocket
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      newSocket.emit('join-room', id);
    });

    // Document listeners
    newSocket.on('document-update', (newContent: string) => {
      setDocumentContent(newContent);
    });

    // Whiteboard listeners
    newSocket.on('whiteboard-update', (newLine: any) => {
      setLines((prev) => [...prev, newLine]);
    });

    newSocket.on('whiteboard-cleared', () => {
      setLines([]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, user, navigate]);

  // Handle resize for canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Document Handlers
  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setDocumentContent(newContent);
    if (socket) {
      socket.emit('document-change', { roomId: id, content: newContent });
    }
  };

  // Whiteboard Handlers
  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, size: brushSize, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (socket && lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      socket.emit('whiteboard-draw', { roomId: id, line: lastLine });
    }
  };

  const clearWhiteboard = () => {
    setLines([]);
    if (socket) {
      socket.emit('whiteboard-clear', id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            Sala de Colaboração
          </h1>
        </div>
        
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'document' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Documento
          </button>
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'whiteboard' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PenTool className="h-4 w-4" />
            Quadro Branco
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
        {activeTab === 'document' ? (
          <div className="flex-1 flex flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Documento Compartilhado</h2>
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sincronizado
              </span>
            </div>
            <textarea
              value={documentContent}
              onChange={handleDocumentChange}
              placeholder="Comece a digitar aqui... Todos na sala verão as alterações em tempo real."
              className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-6 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-sans leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setTool('pen')}
                    className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    title="Caneta"
                  >
                    <PenTool className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTool('eraser')}
                    className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    title="Borracha"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="h-8 w-px bg-white/10"></div>
                
                <div className="flex items-center gap-2">
                  {['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setTool('pen'); }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool === 'pen' ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                
                <div className="h-8 w-px bg-white/10"></div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Tamanho:</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-24 accent-indigo-500"
                  />
                </div>
              </div>
              
              <Button 
                onClick={clearWhiteboard}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center gap-2 py-1.5 px-3 h-auto text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Quadro
              </Button>
            </div>
            
            <div className="flex-1 bg-zinc-950 relative overflow-hidden cursor-crosshair" ref={containerRef}>
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                ref={stageRef}
              >
                <Layer>
                  {lines.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={line.tool === 'eraser' ? '#09090b' : line.color}
                      strokeWidth={line.size}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={
                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
