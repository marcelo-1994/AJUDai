import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  StickyNote, 
  CheckSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const PersonalTools = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notes' | 'events' | 'checklists'>('notes');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [notes, setNotes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  
  // Form states
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newEvent, setNewEvent] = useState({ title: '', start_time: '' });
  const [newChecklist, setNewChecklist] = useState({ title: '' });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'notes') {
        const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
        setNotes(data || []);
      } else if (activeTab === 'events') {
        const { data } = await supabase.from('events').select('*').order('start_time', { ascending: true });
        setEvents(data || []);
      } else if (activeTab === 'checklists') {
        const { data } = await supabase.from('checklists').select('*, checklist_items(*)').order('created_at', { ascending: false });
        setChecklists(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title) return;
    try {
      const { error } = await supabase.from('notes').insert([{ ...newNote, user_id: user?.id }]);
      if (error) throw error;
      setNewNote({ title: '', content: '' });
      fetchData();
    } catch (error) {
      alert('Erro ao adicionar nota');
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start_time) return;
    try {
      const { error } = await supabase.from('events').insert([{ ...newEvent, user_id: user?.id }]);
      if (error) throw error;
      setNewEvent({ title: '', start_time: '' });
      fetchData();
    } catch (error) {
      alert('Erro ao adicionar evento');
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklist.title) return;
    try {
      const { error } = await supabase.from('checklists').insert([{ ...newChecklist, user_id: user?.id }]);
      if (error) throw error;
      setNewChecklist({ title: '' });
      fetchData();
    } catch (error) {
      alert('Erro ao adicionar checklist');
    }
  };

  const handleDelete = async (table: string, id: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Erro ao excluir');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Ferramentas Pessoais</h1>
          <p className="text-zinc-400">Organize seus eventos, notas e tarefas em um só lugar.</p>
        </div>
        
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
          >
            <StickyNote className="h-4 w-4" /> Notas
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'events' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
          >
            <Calendar className="h-4 w-4" /> Eventos
          </button>
          <button 
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'checklists' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
          >
            <CheckSquare className="h-4 w-4" /> Checklists
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl border-white/10 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" />
              Novo {activeTab === 'notes' ? 'Nota' : activeTab === 'events' ? 'Evento' : 'Checklist'}
            </h3>
            
            <div className="space-y-4">
              {activeTab === 'notes' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Título da nota"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newNote.title}
                    onChange={e => setNewNote({...newNote, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Conteúdo..."
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newNote.content}
                    onChange={e => setNewNote({...newNote, content: e.target.value})}
                  />
                  <Button onClick={handleAddNote} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Salvar Nota</Button>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Título do evento"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                  <input 
                    type="datetime-local" 
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newEvent.start_time}
                    onChange={e => setNewEvent({...newEvent, start_time: e.target.value})}
                  />
                  <Button onClick={handleAddEvent} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Agendar Evento</Button>
                </>
              )}

              {activeTab === 'checklists' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Título do checklist"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newChecklist.title}
                    onChange={e => setNewChecklist({...newChecklist, title: e.target.value})}
                  />
                  <Button onClick={handleAddChecklist} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Criar Checklist</Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTab === 'notes' && notes.map(note => (
                <div key={note.id} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white">{note.title}</h4>
                    <button onClick={() => handleDelete('notes', note.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-[10px] text-zinc-600 mt-4">{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
              ))}

              {activeTab === 'events' && events.map(event => (
                <div key={event.id} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-4">
                  <div className="bg-indigo-600/20 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{event.title}</h4>
                    <p className="text-zinc-400 text-xs">{new Date(event.start_time).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete('events', event.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {activeTab === 'checklists' && checklists.map(list => (
                <div key={list.id} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-white">{list.title}</h4>
                    <button onClick={() => handleDelete('checklists', list.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {list.checklist_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-zinc-400">
                        {item.is_completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4" />}
                        <span>{item.content}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-zinc-600 italic">Clique para gerenciar itens (em breve)</p>
                  </div>
                </div>
              ))}

              {((activeTab === 'notes' && notes.length === 0) || 
                (activeTab === 'events' && events.length === 0) || 
                (activeTab === 'checklists' && checklists.length === 0)) && (
                <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <AlertCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Nenhum item encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
