import React, { useState, useMemo } from 'react';
import { INITIAL_DATA } from '../constants';
import { Contact, Tag } from '../types';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Download,
  Trash2,
  Edit2,
  Mail,
  Phone,
  User,
  Tag as TagIcon,
  CheckSquare,
  Square
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const ContactsInterface: React.FC = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

  // Fetch Contacts
  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/kanban`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Flatten columns to list
          const allContacts = data.flatMap((col: any) => col.items);
          setContacts(allContacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    if (token) fetchContacts();
  }, [token, API_URL]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Filter Logic
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  // CRUD Actions
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setShowModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

    if (editingContact) {
      // Edit existing
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, name, phone } : c));
    } else {
      // Create new
      const newContact: Contact = {
        id: Date.now().toString(),
        name,
        phone,
        avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
        lastMessageTime: 'Agora',
        unreadCount: 0,
        tags: [],
        assignedTo: 'Você',
        status: 'offline'
      };
      setContacts([newContact, ...contacts]);
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#DFE3E5] overflow-hidden">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contatos</h1>
          <p className="text-sm text-gray-500">Gerencie sua base de clientes ({contacts.length} total)</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600" title="Filtros">
            <Filter size={20} />
          </button>

          <button
            onClick={handleAddNew}
            className="bg-[#00A884] hover:bg-[#008f6f] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Novo Contato</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (Conditional) */}
      {selectedContacts.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 flex items-center justify-between text-sm text-emerald-800 animate-in slide-in-from-top-2">
          <span className="font-medium">{selectedContacts.length} contatos selecionados</span>
          <div className="flex gap-4">
            <button className="hover:underline flex items-center gap-1"><Download size={14} /> Exportar</button>
            <button className="hover:underline flex items-center gap-1 text-red-600"><Trash2 size={14} /> Excluir</button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-emerald-600">
                    {selectedContacts.length === filteredContacts.length && filteredContacts.length > 0 ? (
                      <CheckSquare size={20} className="text-emerald-600" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-6 py-3">
                    <button onClick={() => toggleSelectContact(contact.id)} className="flex items-center text-gray-300 hover:text-emerald-600">
                      {selectedContacts.includes(contact.id) ? (
                        <CheckSquare size={20} className="text-emerald-600" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={contact.avatarUrl}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{contact.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={10} /> {contact.name.toLowerCase().replace(/\s+/g, '.')}@email.com
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600 font-medium">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.length > 0 ? contact.tags.map((tag, i) => (
                        <span key={i} className={`w-2.5 h-2.5 rounded-full ${tag.color === 'red' ? 'bg-red-500' : tag.color === 'green' ? 'bg-green-500' : 'bg-blue-400'}`} title={tag.label || 'Tag'}></span>
                      )) : (
                        <span className="text-xs text-gray-400 italic">Sem tags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 bg-gray-100 w-fit px-2 py-1 rounded text-xs text-gray-700">
                      <User size={12} />
                      {contact.assignedTo}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(contact)} className="p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Nenhum contato encontrado para "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingContact?.name}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="Ex: Maria Silva"
                      required
                    />
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                  <div className="relative">
                    <input
                      name="phone"
                      type="text"
                      defaultValue={editingContact?.phone}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="+55 11 99999-9999"
                      required
                    />
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="cliente@email.com"
                    />
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option>Você</option>
                    <option>Hebrain</option>
                    <option>Equipe Vendas</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  {editingContact ? <Edit2 size={16} /> : <Plus size={16} />}
                  {editingContact ? 'Salvar Alterações' : 'Criar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsInterface;