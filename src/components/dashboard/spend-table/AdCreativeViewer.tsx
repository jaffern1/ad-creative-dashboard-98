
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdCreativeViewerProps {
  selectedItem: string | null;
  selectedAdFileLink: string | null;
}

export const AdCreativeViewer: React.FC<AdCreativeViewerProps> = ({
  selectedItem,
  selectedAdFileLink
}) => {
  // Convert Google Drive share link to embeddable format
  const getEmbedUrl = (driveUrl: string) => {
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveUrl;
  };

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3">
        <CardTitle className="text-base font-medium">
          Ad Creative
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {selectedItem && selectedAdFileLink ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{selectedItem}</h3>
            <div className="w-full aspect-[4/5] rounded-md overflow-hidden shadow-sm border border-border">
              <iframe
                src={getEmbedUrl(selectedAdFileLink)}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                title={`Creative for ${selectedItem}`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            {selectedItem ? 'No creative available for this item' : 'Click on an item to view ad creative'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
