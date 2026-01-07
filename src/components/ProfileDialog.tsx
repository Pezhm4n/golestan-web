import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock, User, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditMode = 'none' | 'name' | 'password' | 'both';

const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [initialFullName, setInitialFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('none');

  const email = user?.email ?? '';
  const currentFullName =
    (user?.user_metadata?.full_name as string | undefined) || '';

  useEffect(() => {
    if (open && user) {
      const name =
        (user.user_metadata?.full_name as string | undefined) || '';
      setFullName(name);
      setInitialFullName(name);
      setCurrentPassword('');
      setCurrentPasswordError(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setEditMode('none');
    }
  }, [open, user]);

  if (!user) {
    return null;
  }

  const initials =
    (currentFullName && currentFullName.trim()[0]?.toUpperCase()) ||
    (email && email.trim()[0]?.toUpperCase()) ||
    'U';

  const isEditingName = editMode === 'name' || editMode === 'both';
  const isEditingPassword = editMode === 'password' || editMode === 'both';
  const isEditing = editMode !== 'none';

  const enableNameEdit = () => {
    setEditMode((mode) => {
      if (mode === 'none') return 'name';
      if (mode === 'password') return 'both';
      return mode;
    });
  };

  const enablePasswordEdit = () => {
    setEditMode((mode) => {
      if (mode === 'none') return 'password';
      if (mode === 'name') return 'both';
      return mode;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    const trimmedName = fullName.trim();
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmNewPassword.trim();

    const updates: {
      data?: Record<string, unknown>;
      password?: string;
    } = {};

    // Handle name update
    if (isEditingName && trimmedName !== initialFullName) {
      updates.data = {
        ...(user.user_metadata || {}),
        full_name: trimmedName,
      };
    }

    // Handle password update
    if (isEditingPassword) {
      if (!trimmedCurrentPassword) {
        setCurrentPasswordError(true);
        toast.error(t('auth.profileCurrentPasswordRequired'));
        return;
      }

      if (!trimmedPassword || trimmedPassword.length < 6) {
        toast.error(t('auth.profilePasswordTooShort'));
        return;
      }

      if (trimmedPassword !== trimmedConfirm) {
        toast.error(t('auth.profilePasswordMismatch'));
        return;
      }

      // Verify current password by re-signing in
      try {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: trimmedCurrentPassword,
        });

        if (verifyError) {
          setCurrentPasswordError(true);
          toast.error(t('auth.profileCurrentPasswordIncorrect'));
          return;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t('auth.networkErrorFallback');
        toast.error(message);
        return;
      }

      updates.password = trimmedPassword;
    }

    if (!updates.data && !updates.password) {
      // Nothing changed
      setEditMode('none');
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        toast.error(error.message || t('auth.networkErrorFallback'));
        return;
      }

      toast.success(t('auth.profileUpdateSuccess'));
      setEditMode('none');
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : t('auth.networkErrorFallback');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    // reset to initial values and exit edit mode
    setFullName(initialFullName);
    setCurrentPassword('');
    setCurrentPasswordError(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setEditMode('none');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('auth.accountSettings')}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            {t('auth.accountSettingsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar & Email */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-semibold text-foreground">
                {currentFullName || email}
              </span>
              <span className="text-muted-foreground">{email}</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileFullName" className="text-xs">
                {t('auth.profileFullNameLabel')}
              </Label>
              {!isEditingName && (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  onClick={enableNameEdit}
                  aria-label={t('auth.profileEditButton')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Input
              id="profileFullName"
              dir="rtl"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              className="text-xs"
              disabled={!isEditingName || isSubmitting}
            />
          </div>

          {/* Password change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{t('auth.profilePasswordSectionTitle')}</span>
              </div>
              {!isEditingPassword && (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  onClick={enablePasswordEdit}
                  aria-label={t('auth.profileEditButton')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="profileCurrentPassword" className="text-[11px]">
                {t('auth.profileCurrentPasswordLabel')}
              </Label>
              <Input
                id="profileCurrentPassword"
                type="password"
                dir="ltr"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) {
                    setCurrentPasswordError(false);
                  }
                }}
                placeholder={t('auth.profileCurrentPasswordPlaceholder')}
                className={`text-xs ${currentPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={!isEditingPassword || isSubmitting}
                aria-invalid={currentPasswordError || undefined}
              />
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="profileNewPassword" className="text-[11px]">
                {t('auth.profileNewPasswordLabel')}
              </Label>
              <Input
                id="profileNewPassword"
                type="password"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholderSignup')}
                className="text-xs"
                disabled={!isEditingPassword || isSubmitting}
              />
            </div>

            {/* Confirm new password */}
            <div className="space-y-1.5">
              <Label htmlFor="profileConfirmNewPassword" className="text-[11px]">
                {t('auth.profileConfirmNewPasswordLabel')}
              </Label>
              <Input
                id="profileConfirmNewPassword"
                type="password"
                dir="ltr"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="text-xs"
                disabled={!isEditingPassword || isSubmitting}
              />
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('auth.profilePasswordHint')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                {t('addCourse.cancel')}
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                )}
                <span>{t('auth.profileSaveButton')}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setEditMode('name')}
            >
              <Pencil className="h-3.5 w-3.5 ml-1" />
              {t('auth.profileEditButton')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;