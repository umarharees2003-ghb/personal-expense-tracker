import React from 'react';
import { Grid2X2, Pencil, Plus, Trash2 } from 'lucide-react';
import { IconBox, money } from './common.jsx';
import { RequestStatus } from './RequestStatus.jsx';

export function CategoriesPage({ categories, onAdd, onEdit, onDelete, loading, error, onRetry, actionsDisabled }) {
  return <>
    <div className="page-title-row">
      <div><div className="eyebrow"><span className="live-dot" /> A PLACE FOR EVERYTHING</div><h1>Your categories</h1><p>Organise your spending in a way that makes sense to you.</p></div>
      <button className="button-primary" onClick={onAdd} disabled={actionsDisabled}><Plus size={17} /> Add category</button>
    </div>
    <div className="category-intro-card"><div className="category-intro-icon"><Grid2X2 size={21} /></div><div><strong>Make your money make sense.</strong><p>Categories help you spot patterns and build better habits, one transaction at a time.</p></div><span>{categories.length} categories</span></div>
    <RequestStatus loading={loading} error={error} onRetry={onRetry} />
    {!loading && !error && <div className="category-cards-grid">
      {categories.map((item) => <div className="category-card" key={item.id}>
        <div className="category-card-top"><IconBox icon={item.icon} color={item.color} size={20} /><div className="category-actions">
          <button className="icon-button category-more" aria-label={`Edit ${item.name} category`} onClick={() => onEdit(item)} disabled={actionsDisabled}><Pencil size={15} /></button>
          <button className="icon-button category-more" aria-label={`Delete ${item.name} category`} onClick={() => onDelete(item)} disabled={actionsDisabled}><Trash2 size={15} /></button>
        </div></div>
        <strong className="category-card-name">{item.name}</strong>
        <span className="category-trans-count">{item.count} {item.count === 1 ? 'transaction' : 'transactions'}</span>
        <div className="category-budget"><div><small>Spent this month</small><strong>{money(item.spent)}</strong></div></div>
      </div>)}
      <button className="add-category-card" onClick={onAdd} disabled={actionsDisabled}><span><Plus size={19} /></span><strong>Create a category</strong><small>Give your spending a new home</small></button>
      {!categories.length && <p className="empty-state">No categories yet. Create one to organize your transactions.</p>}
    </div>}
  </>;
}
