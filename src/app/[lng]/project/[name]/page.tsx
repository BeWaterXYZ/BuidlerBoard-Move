'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ProjectEndorsement, Repository } from '@/types/supabase';
import { ConnectButton, useWallet } from '@razorlabs/razorkit';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';
import { useTranslation } from '@/app/i18n/client';

export default function ProjectProfile({ 
  params: { lng, name } 
}: { 
  params: { lng: string; name: string } 
}) {
  const { t } = useTranslation(lng, 'project');
  const { data: project } = useQuery<Repository>(['project', name], 
    () => fetch(`/api/github?type=project-list&name=${name}`).then(res => res.json())
  );

  if (!project) return <div>{t('loading')}</div>;

  return (
    <div className="container mx-auto p-4">
      <ProjectInfo project={project} t={t} />
      <ContributorSection contributors={project.contributors} t={t} />
      <EndorsementSection name={name} endorsements={project.endorsements || []} t={t} lng={lng} />
    </div>
  );
}

function ProjectInfo({ project, t }: { project: Repository; t: any }) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="flex gap-2">
          {project.badges?.map((badge) => (
            <img
              key={badge.type}
              src={`/api/badges/${badge.type}`}
              alt={badge.name}
              className="w-8 h-8"
              title={badge.name}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-600">{project.description}</p>
      <div className="flex space-x-4">
        <span>⭐ {t('stars', { count: project.stargazers_count })}</span>
        <span>🔄 {t('forks', { count: project.forks_count })}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {project.languages.map(lang => (
          <span key={lang} className="px-2 py-1 bg-gray-100 rounded">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContributorSection({ contributors, t }: { contributors: any[]; t: any }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('contributors.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contributors?.map((contributor) => (
          <div key={contributor.login} className="flex items-center space-x-2">
            <img 
              src={contributor.avatar_url} 
              alt={contributor.login}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium">{contributor.login}</div>
              <div className="text-sm text-gray-500">
                {contributor.contributions} commits
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndorsementSection({ 
  name, 
  endorsements, 
  t, 
  lng 
}: { 
  name: string; 
  endorsements: ProjectEndorsement[]; 
  t: any; 
  lng: string 
}) {
  const [message, setMessage] = useState('');
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const endorseMutation = useMutation(
    async (message: string) => {
      if (!connected || !account) {
        throw new Error(t('endorsements.wallet_required'));
      }

      try {
        const payload: InputGenerateTransactionPayloadData = {
          function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::github_score::endorse_project`,
          typeArguments: [],
          functionArguments: [name, message]
        };

        const resp = await signAndSubmitTransaction({
          payload,
        });

        return resp;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error(t('endorsements.transaction_failed'));
      }
    },
    {
      onSuccess: () => {
        setMessage('');
      }
    }
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('endorsements.title')}</h2>
      <div className="space-y-4 mb-6">
        {endorsements?.map((endorsement) => (
          <div 
            key={`${endorsement.from}-${endorsement.timestamp}`}
            className="p-4 border rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="font-medium">{t('endorsements.from')}</div>
              <div className="text-sm text-gray-500">
                {shortenAddress(endorsement.from)}
              </div>
            </div>
            <p className="mt-2">{endorsement.message}</p>
            <div className="text-sm text-gray-500 mt-2">
              {new Date(Number(endorsement.timestamp) * 1000).toLocaleDateString(lng)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        {!connected ? (
          <ConnectButton className="w-full" />
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('endorsements.write_endorsement')}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
            <button
              onClick={() => endorseMutation.mutate(message)}
              disabled={endorseMutation.isLoading || !message.trim()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {endorseMutation.isLoading ? t('endorsements.submitting') : t('endorsements.submit')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
} 