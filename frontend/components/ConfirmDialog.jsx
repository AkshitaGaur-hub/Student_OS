import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
}) {
  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        variant={isDanger ? 'danger' : 'primary'}
        size="sm"
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} footer={footer} maxWidth="max-w-md">
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

