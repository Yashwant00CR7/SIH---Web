import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('occurrences');

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search in scientific names and localities
    const searchQuery = {
      $or: [
        { scientificName: { $regex: query, $options: 'i' } },
        { locality: { $regex: query, $options: 'i' } },
        { habitat: { $regex: query, $options: 'i' } },
        { waterBody: { $regex: query, $options: 'i' } }
      ]
    };

    const pipeline = [
      { $match: searchQuery },
      {
        $group: {
          _id: '$scientificName',
          scientificName: { $first: '$scientificName' },
          occurrenceCount: { $sum: 1 },
          localities: { $addToSet: '$locality' },
          habitats: { $addToSet: '$habitat' }
        }
      },
      { $sort: { occurrenceCount: -1 } },
      { $limit: limit }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const searchResults = results.map(result => ({
      id: result._id,
      scientificName: result.scientificName,
      name: result.scientificName?.split(' ')[0] || 'Unknown',
      occurrenceCount: result.occurrenceCount,
      localities: result.localities?.filter(Boolean).slice(0, 3) || [],
      habitats: result.habitats?.filter(Boolean) || []
    }));

    return NextResponse.json({ results: searchResults });

  } catch (error) {
    console.error('Error searching fish species:', error);
    return NextResponse.json(
      { error: 'Failed to search fish species' },
      { status: 500 }
    );
  }
}