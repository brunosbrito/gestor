import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Shield, Users, Building2, BarChart3 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'comercial':
        return Users;
      case 'suprimentos':
        return Building2;
      case 'diretoria':
        return BarChart3;
      default:
        return User;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'comercial':
        return 'Comercial';
      case 'suprimentos':
        return 'Suprimentos';
      case 'diretoria':
        return 'Diretoria';
      case 'cliente':
        return 'Cliente';
      default:
        return role;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-auto p-3">
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {getUserInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{user.full_name}</div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <RoleIcon className="h-3 w-3" />
                <span>{getRoleDisplayName(user.role)}</span>
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{user.full_name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-500">@{user.username}</div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;