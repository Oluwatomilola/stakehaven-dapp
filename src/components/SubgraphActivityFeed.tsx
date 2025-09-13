import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRecentActivities } from "@/hooks/useSubgraphQueries"
import { formatEther } from "viem"
import { ArrowUpIcon, ArrowDownIcon, CoinsIcon, AlertTriangleIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Activity {
  id: string
  user: { id: string }
  amount: string
  timestamp: string
  transactionHash: string
  type: 'stake' | 'withdraw' | 'claim' | 'emergency'
}

export function SubgraphActivityFeed() {
  const { data, isLoading, error } = useRecentActivities(20)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest protocol transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest protocol transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load recent activities</p>
        </CardContent>
      </Card>
    )
  }

  // Combine and sort all activities
  const allActivities: Activity[] = [
    ...((data as any)?.stakingPositions?.map((item: any) => ({
      ...item,
      type: 'stake' as const
    })) || []),
    ...((data as any)?.withdrawals?.map((item: any) => ({
      ...item,
      type: 'withdraw' as const
    })) || []),
    ...((data as any)?.rewardsClaimed?.map((item: any) => ({
      ...item,
      type: 'claim' as const
    })) || []),
    ...((data as any)?.emergencyWithdrawals?.map((item: any) => ({
      ...item,
      type: 'emergency' as const
    })) || [])
  ].sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stake':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />
      case 'withdraw':
        return <ArrowDownIcon className="h-4 w-4 text-blue-500" />
      case 'claim':
        return <CoinsIcon className="h-4 w-4 text-yellow-500" />
      case 'emergency':
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />
      default:
        return <CoinsIcon className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'stake':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Stake</Badge>
      case 'withdraw':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Withdraw</Badge>
      case 'claim':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Claim</Badge>
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Activity
          <Badge variant="outline">{allActivities.length}</Badge>
        </CardTitle>
        <CardDescription>Latest protocol transactions from subgraph</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {allActivities.slice(0, 20).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityBadge(activity.type)}
                  <span className="text-sm font-medium">
                    {formatAddress(activity.user.id)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  {parseFloat(formatEther(BigInt(activity.amount))).toFixed(4)} tokens
                </div>
                <a
                  href={`https://etherscan.io/tx/${activity.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  View TX
                </a>
              </div>
            </div>
          ))}
          
          {allActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recent activities found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}