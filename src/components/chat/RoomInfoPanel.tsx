"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Video, 
  Bell, 
  Settings,
  UserPlus,
  LogOut,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RoomInfoPanelProps {
  activeRoom: any;
  activeChatPartner: string | null;
  myId: string | undefined;
  presence: Record<string, string>;
}

export function RoomInfoPanel({ 
  activeRoom, 
  activeChatPartner, 
  myId, 
  presence 
}: RoomInfoPanelProps) {
  if (!activeRoom || !activeChatPartner) {
    return null;
  }

  const otherId = activeRoom?.memberIds?.find((id: string) => id !== myId);
  const userStatus = presence[otherId as string] || 'offline';
  const isOnline = userStatus === 'online';

  const roomMembers = activeRoom.usernames || [];

  return (
    <Card className="w-80 flex-shrink-0 rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-700 text-white font-extrabold text-2xl">
              {activeChatPartner?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2">
            <h3 className="font-black text-slate-900 tracking-tight text-xl">
              {activeChatPartner}
            </h3>
            
            <div className="flex items-center justify-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                isOnline ? "bg-emerald-500" : "bg-slate-300"
              )} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Room Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Room Details
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Type</span>
              <Badge variant="outline" className="text-xs">
                {activeRoom.type === 'd' ? 'Direct Message' : 'Group'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Room ID</span>
              <span className="text-xs font-mono text-slate-400 truncate max-w-[120px]">
                {activeRoom._id}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Members */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Members ({roomMembers.length})
          </h4>
          
          <div className="space-y-2">
            {roomMembers.map((username: string, index: number) => {
              const memberId = activeRoom.memberIds?.[index];
              const memberStatus = presence[memberId] || 'offline';
              
              return (
                <div 
                  key={username}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {username}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    memberStatus === 'online' ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Actions
          </h4>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-3" />
            Notifications
          </Button>
          
          {activeRoom.type !== 'd' && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-3" />
              Add Members
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
          
          <Separator className="my-2" />
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Leave Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
