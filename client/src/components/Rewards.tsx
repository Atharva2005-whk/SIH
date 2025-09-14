import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  Award, 
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Medal,
  Crown,
  Gem,
  Coins,
  ShoppingBag,
  MapPin,
  Shield,
  FileText,
  Calendar
} from 'lucide-react';
import { mockDB } from '../services/mockDatabase';
import type { Reward } from '../services/mockDatabase';

interface RewardsProps {
  userId: number;
  userName?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  points: number;
  category: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: Date;
}

interface RewardTier {
  name: string;
  minPoints: number;
  color: string;
  bgColor: string;
  icon: React.ComponentType<any>;
  benefits: string[];
}

export function Rewards({ userId, userName = 'Tourist' }: RewardsProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentTier, setCurrentTier] = useState<RewardTier | null>(null);
  const [nextTier, setNextTier] = useState<RewardTier | null>(null);
  const [loading, setLoading] = useState(true);

  const rewardTiers: RewardTier[] = [
    {
      name: 'Explorer',
      minPoints: 0,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: MapPin,
      benefits: ['Basic safety alerts', 'Location tracking']
    },
    {
      name: 'Adventurer', 
      minPoints: 100,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: Shield,
      benefits: ['Priority support', 'Advanced safety tips', 'Reward multiplier 1.2x']
    },
    {
      name: 'Guardian',
      minPoints: 300,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: Medal,
      benefits: ['VIP emergency response', 'Exclusive safety zones', 'Reward multiplier 1.5x']
    },
    {
      name: 'Champion',
      minPoints: 500,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      icon: Crown,
      benefits: ['Premium concierge', 'All access zones', 'Reward multiplier 2x', 'Special recognition']
    }
  ];

  const allAchievements: Achievement[] = [
    {
      id: 'first_verification',
      title: 'First Steps',
      description: 'Complete your first document verification',
      icon: FileText,
      points: 100,
      category: 'Getting Started',
      unlocked: false
    },
    {
      id: 'safety_first',
      title: 'Safety First',
      description: 'Follow all safety guidelines for 7 days',
      icon: Shield,
      points: 150,
      category: 'Safety',
      unlocked: false,
      progress: 0,
      maxProgress: 7
    },
    {
      id: 'location_master',
      title: 'Location Master',
      description: 'Update location regularly for 30 days',
      icon: MapPin,
      points: 200,
      category: 'Location',
      unlocked: false,
      progress: 0,
      maxProgress: 30
    },
    {
      id: 'emergency_hero',
      title: 'Emergency Hero',
      description: 'Participate in emergency drill',
      icon: Zap,
      points: 250,
      category: 'Emergency',
      unlocked: false
    },
    {
      id: 'helping_hand',
      title: 'Helping Hand',
      description: 'Help another tourist in need',
      icon: Trophy,
      points: 200,
      category: 'Community',
      unlocked: false
    },
    {
      id: 'perfect_week',
      title: 'Perfect Week',
      description: 'Complete all daily safety checks for a week',
      icon: Calendar,
      points: 300,
      category: 'Consistency',
      unlocked: false,
      progress: 0,
      maxProgress: 7
    }
  ];

  useEffect(() => {
    loadRewardsData();
  }, [userId]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      const userRewards = await mockDB.getRewardsByUserId(userId);
      const points = await mockDB.getTotalRewardPoints(userId);
      
      setRewards(userRewards);
      setTotalPoints(points);
      
      // Update achievements based on rewards
      const updatedAchievements = allAchievements.map(achievement => {
        const relatedRewards = userRewards.filter(r => r.category === achievement.category.toLowerCase().replace(' ', '_'));
        
        switch (achievement.id) {
          case 'first_verification':
            return {
              ...achievement,
              unlocked: userRewards.some(r => r.category === 'document_verification'),
              unlockedAt: userRewards.find(r => r.category === 'document_verification')?.earnedAt
            };
          case 'emergency_hero':
            return {
              ...achievement,
              unlocked: userRewards.some(r => r.category === 'emergency_drill'),
              unlockedAt: userRewards.find(r => r.category === 'emergency_drill')?.earnedAt
            };
          case 'helping_hand':
            return {
              ...achievement,
              unlocked: userRewards.some(r => r.reason.includes('helped')),
              unlockedAt: userRewards.find(r => r.reason.includes('helped'))?.earnedAt
            };
          case 'safety_first':
            const safetyRewards = userRewards.filter(r => r.category === 'safety_compliance');
            return {
              ...achievement,
              progress: Math.min(safetyRewards.length, 7),
              unlocked: safetyRewards.length >= 7,
              unlockedAt: safetyRewards.length >= 7 ? safetyRewards[6]?.earnedAt : undefined
            };
          case 'location_master':
            const locationRewards = userRewards.filter(r => r.category === 'location_update');
            return {
              ...achievement,
              progress: Math.min(locationRewards.length, 30),
              unlocked: locationRewards.length >= 30,
              unlockedAt: locationRewards.length >= 30 ? locationRewards[29]?.earnedAt : undefined
            };
          default:
            return achievement;
        }
      });
      
      setAchievements(updatedAchievements);
      
      // Determine current tier
      const current = rewardTiers
        .filter(tier => points >= tier.minPoints)
        .pop() || rewardTiers[0];
      setCurrentTier(current);
      
      // Find next tier
      const next = rewardTiers.find(tier => points < tier.minPoints);
      setNextTier(next || null);
      
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with current status */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h3>
            <p className="text-purple-100">You're making great progress on your safety journey</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="h-6 w-6 text-yellow-300" />
              <span className="text-3xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-sm text-purple-100">Total Points</p>
          </div>
        </div>
      </div>

      {/* Current Tier and Progress */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Trophy className="h-6 w-6 text-purple-600 mr-2" />
          Your Status
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Tier */}
          <div className={`${currentTier?.bgColor} rounded-2xl p-6 border border-gray-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 ${currentTier?.bgColor} rounded-full border-2 border-white shadow-lg`}>
                {currentTier?.icon && <currentTier.icon className={`h-6 w-6 ${currentTier.color}`} />}
              </div>
              <div>
                <h5 className={`text-lg font-semibold ${currentTier?.color}`}>
                  {currentTier?.name}
                </h5>
                <p className="text-sm text-gray-600">Current Level</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Benefits:</p>
              {currentTier?.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Tier Progress */}
          {nextTier && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gray-200 rounded-full">
                  <nextTier.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">
                    {nextTier.name}
                  </h5>
                  <p className="text-sm text-gray-600">Next Level</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {totalPoints} / {nextTier.minPoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(totalPoints / nextTier.minPoints) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {nextTier.minPoints - totalPoints} points to next level
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Star className="h-6 w-6 text-yellow-600 mr-2" />
          Recent Rewards
        </h4>
        
        <div className="space-y-4">
          {rewards.slice(0, 5).map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{reward.reason}</p>
                  <p className="text-sm text-gray-600">{formatDate(reward.earnedAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-bold text-lg text-yellow-700">+{reward.points}</span>
              </div>
            </div>
          ))}
          
          {rewards.length === 0 && (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rewards earned yet</p>
              <p className="text-sm text-gray-500 mt-2">Complete safety activities to earn your first reward!</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Award className="h-6 w-6 text-purple-600 mr-2" />
          Achievements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <achievement.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-semibold ${
                    achievement.unlocked ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </h5>
                  <p className={`text-sm mt-1 ${
                    achievement.unlocked ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {/* Progress bar for progressive achievements */}
                  {achievement.maxProgress && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${getProgressPercentage(achievement.progress || 0, achievement.maxProgress)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Points and unlock date */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1">
                      <Coins className={`h-4 w-4 ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {achievement.points} pts
                      </span>
                    </div>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-green-600">
                        {formatDate(achievement.unlockedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Rewards */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-200">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ShoppingBag className="h-6 w-6 text-indigo-600 mr-2" />
          Redeem Your Points
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Travel Voucher</h5>
              <p className="text-sm text-gray-600 mt-1">₹500 travel discount</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-700">200 points</span>
              </div>
              <button
                disabled={totalPoints < 200}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {totalPoints >= 200 ? 'Redeem' : 'Insufficient Points'}
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Premium Safety</h5>
              <p className="text-sm text-gray-600 mt-1">1 month premium features</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-700">150 points</span>
              </div>
              <button
                disabled={totalPoints < 150}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {totalPoints >= 150 ? 'Redeem' : 'Insufficient Points'}
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Gift Card</h5>
              <p className="text-sm text-gray-600 mt-1">₹1000 shopping voucher</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-700">400 points</span>
              </div>
              <button
                disabled={totalPoints < 400}
                className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {totalPoints >= 400 ? 'Redeem' : 'Insufficient Points'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
