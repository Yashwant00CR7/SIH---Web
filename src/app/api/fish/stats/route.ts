import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('occurrences');

        // Get overall statistics
        const [
            totalOccurrences,
            uniqueSpecies,
            habitatStats,
            locationStats,
            depthStats
        ] = await Promise.all([
            // Total occurrences
            collection.countDocuments(),

            // Unique species count
            collection.distinct('scientificName').then(species => species.filter(Boolean).length),

            // Habitat distribution
            collection.aggregate([
                { $match: { habitat: { $exists: true, $ne: null, $ne: '' } } },
                { $group: { _id: '$habitat', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray(),

            // Location distribution
            collection.aggregate([
                { $match: { locality: { $exists: true, $ne: null, $ne: '' } } },
                { $group: { _id: '$locality', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]).toArray(),

            // Depth statistics
            collection.aggregate([
                {
                    $match: {
                        minimumDepthInMeters: { $exists: true, $ne: null, $ne: '' },
                        maximumDepthInMeters: { $exists: true, $ne: null, $ne: '' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgMinDepth: { $avg: { $toDouble: '$minimumDepthInMeters' } },
                        avgMaxDepth: { $avg: { $toDouble: '$maximumDepthInMeters' } },
                        minDepth: { $min: { $toDouble: '$minimumDepthInMeters' } },
                        maxDepth: { $max: { $toDouble: '$maximumDepthInMeters' } }
                    }
                }
            ]).toArray()
        ]);

        // Get top species by occurrence count
        const topSpecies = await collection.aggregate([
            { $match: { scientificName: { $exists: true, $ne: null, $ne: '' } } },
            {
                $group: {
                    _id: '$scientificName',
                    count: { $sum: 1 },
                    localities: { $addToSet: '$locality' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).toArray();

        // Get recent activity (last 30 days worth of data based on eventDate)
        const recentActivity = await collection.aggregate([
            {
                $match: {
                    eventDate: { $exists: true, $ne: null, $ne: '' }
                }
            },
            { $sort: { eventDate: -1 } },
            { $limit: 100 },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: { $dateFromString: { dateString: '$eventDate' } } } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ]).toArray();

        const stats = {
            overview: {
                totalOccurrences,
                uniqueSpecies,
                totalLocations: locationStats.length,
                totalHabitats: habitatStats.length
            },
            topSpecies: topSpecies.map(species => ({
                scientificName: species._id,
                name: species._id?.split(' ')[0] || 'Unknown',
                occurrenceCount: species.count,
                locationCount: species.localities?.filter(Boolean).length || 0
            })),
            habitatDistribution: habitatStats.map(habitat => ({
                habitat: habitat._id,
                count: habitat.count
            })),
            localityDistribution: locationStats.map(location => ({
                locality: location._id,
                count: location.count
            })),
            depthStatistics: depthStats[0] ? {
                averageMinDepth: Math.round((depthStats[0].avgMinDepth || 0) * 100) / 100,
                averageMaxDepth: Math.round((depthStats[0].avgMaxDepth || 0) * 100) / 100,
                minRecordedDepth: depthStats[0].minDepth || 0,
                maxRecordedDepth: depthStats[0].maxDepth || 0
            } : null,
            recentActivity: recentActivity.map(activity => ({
                date: activity._id,
                occurrences: activity.count
            }))
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching fish statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fish statistics' },
            { status: 500 }
        );
    }
}