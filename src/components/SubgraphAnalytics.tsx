import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDailySnapshots, useTopStakers, useRewardRateHistory } from "@/hooks/useSubgraphQueries"
import { formatEther } from "viem"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon, UsersIcon, CoinsIcon } from "lucide-react"

export function SubgraphAnalytics() {
  const { data: dailyData, isLoading: dailyLoading } = useDailySnapshots(30)
  const { data: topStakers, isLoading: stakersLoading } = useTopStakers(5)
  const { data: rateHistory, isLoading: rateLoading } = useRewardRateHistory(20)

  // Format daily snapshots for charts
  const chartData = (dailyData as any)?.dailyProtocolSnapshots?.map((snapshot: any) => ({
    date: new Date(parseInt(snapshot.date) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalStaked: parseFloat(formatEther(BigInt(snapshot.totalStaked))),
    dailyStaked: parseFloat(formatEther(BigInt(snapshot.dailyStaked))),
    dailyWithdrawn: parseFloat(formatEther(BigInt(snapshot.dailyWithdrawn))),
    dailyRewardsClaimed: parseFloat(formatEther(BigInt(snapshot.dailyRewardsClaimed))),
    totalUsers: parseInt(snapshot.totalUsers),
    newUsers: parseInt(snapshot.newUsersCount)
  })).reverse() || []

  // Format reward rate history
  const rateChartData = (rateHistory as any)?.rewardRateUpdates?.map((update: any) => ({
    date: new Date(parseInt(update.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rate: parseFloat(update.newRate) / 100,
    totalStaked: parseFloat(formatEther(BigInt(update.totalStaked)))
  })).reverse() || []

  if (dailyLoading || stakersLoading || rateLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Protocol Growth Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Total Value Locked (30 Days)
            </CardTitle>
            <CardDescription>Historical TVL growth from subgraph data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString()} tokens`, 'TVL']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalStaked" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Daily Activity
            </CardTitle>
            <CardDescription>Daily staking and withdrawal activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} tokens`, 
                    name === 'dailyStaked' ? 'Staked' : 'Withdrawn'
                  ]}
                />
                <Bar dataKey="dailyStaked" fill="hsl(var(--primary))" />
                <Bar dataKey="dailyWithdrawn" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reward Rate and Top Stakers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CoinsIcon className="h-5 w-5" />
              Reward Rate History
            </CardTitle>
            <CardDescription>APR changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rateChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, 'APR']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Stakers</CardTitle>
            <CardDescription>Largest staking positions from subgraph</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(topStakers as any)?.users?.map((user: any, index: number) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">
                        {`${user.id.slice(0, 6)}...${user.id.slice(-4)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Staking since {new Date(parseInt(user.firstStakeTime) * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {parseFloat(formatEther(BigInt(user.totalStaked))).toLocaleString()} tokens
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Claimed: {parseFloat(formatEther(BigInt(user.totalClaimed))).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || []}
              
              {(!(topStakers as any)?.users || (topStakers as any).users.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No stakers found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Summary (Last 30 Days)</CardTitle>
          <CardDescription>Key metrics from subgraph data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {chartData.reduce((sum, day) => sum + day.dailyStaked, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Staked (30d)</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {chartData.reduce((sum, day) => sum + day.dailyWithdrawn, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Withdrawn (30d)</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {chartData.reduce((sum, day) => sum + day.dailyRewardsClaimed, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Rewards Claimed (30d)</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {chartData.reduce((sum, day) => sum + day.newUsers, 0)}
              </div>
              <div className="text-sm text-muted-foreground">New Users (30d)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}