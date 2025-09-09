import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Percent } from "lucide-react";

interface ProtocolStatsProps {
  totalStaked: string;
  totalUsers: number;
  rewardRate: string;
  protocolAPR: string;
}

export const ProtocolStats = ({ totalStaked, totalUsers, rewardRate, protocolAPR }: ProtocolStatsProps) => {
  const stats = [
    {
      title: "Total Value Locked",
      value: `$${parseFloat(totalStaked).toLocaleString()}`,
      subtitle: "USD equivalent",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Total Stakers",
      value: totalUsers.toLocaleString(),
      subtitle: "Active participants",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Reward Rate",
      value: `${rewardRate} STAKE`,
      subtitle: "Per day",
      icon: TrendingUp,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      title: "Protocol APR",
      value: `${protocolAPR}%`,
      subtitle: "Current yield",
      icon: Percent,
      gradient: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-card border-border/50 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {stat.title}
              <stat.icon className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
          
          {/* Gradient overlay */}
          <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${stat.gradient}`} />
        </Card>
      ))}
    </div>
  );
};