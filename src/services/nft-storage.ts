import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });

const BADGE_METADATA: Record<number, {
  name: string;
  description: string;
  image: string;
}> = {
  1: {
    name: 'Star Contributor',
    description: 'Awarded to developers with exceptional contributions',
    image: '/badges/star-contributor.png'
  },
  2: {
    name: 'Active Developer',
    description: 'Recognized for consistent and active development',
    image: '/badges/active-developer.png'
  },
  3: {
    name: 'Community Leader',
    description: 'Leading and inspiring the developer community',
    image: '/badges/community-leader.png'
  },
  4: {
    name: 'Code Master',
    description: 'Mastery in code quality and technical excellence',
    image: '/badges/code-master.png'
  }
};

export async function uploadBadgeMetadata(badgeType: number) {
  const metadata = BADGE_METADATA[badgeType];
  const imageResponse = await fetch(metadata.image);
  const imageBlob = await imageResponse.blob();
  
  const cid = await client.storeBlob(imageBlob);
  return `ipfs://${cid}`;
} 