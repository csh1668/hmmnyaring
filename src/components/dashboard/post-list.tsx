/**
 * 포스트 목록 및 CRUD 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostSkeleton } from './post-skeleton';
import { toast } from 'sonner';

export function PostList() {
  const trpc = useTRPC();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 포스트 목록 조회
  const { data: posts, isLoading, refetch } = useQuery(trpc.post.getMyPosts.queryOptions());

  // 포스트 생성
  const createMutation = useMutation(trpc.post.create.mutationOptions());

  // 포스트 수정
  const updateMutation = useMutation(trpc.post.update.mutationOptions());

  // 포스트 삭제
  const deleteMutation = useMutation(trpc.post.delete.mutationOptions());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate(
        {
          id: editingId,
          title,
          content: content || undefined,
        },
        {
          onSuccess: () => {
            toast.success('포스트가 수정되었습니다.');
            setTitle('');
            setContent('');
            setEditingId(null);
            refetch();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title,
          content: content || undefined,
          published: true,
        },
        {
          onSuccess: () => {
            toast.success('포스트가 생성되었습니다.');
            setTitle('');
            setContent('');
            setIsCreating(false);
            refetch();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  const handleEdit = (post: { id: string; title: string; content: string | null }) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content || '');
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success('포스트가 삭제되었습니다.');
            refetch();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 포스트 생성 폼 */}
      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? '포스트 수정' : '새 포스트 작성'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="포스트 제목을 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="포스트 내용을 입력하세요"
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? '수정' : '작성'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsCreating(true)}>+ 새 포스트 작성</Button>
      )}

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      {post.published ? (
                        <span className="ml-2 text-green-600">• 공개</span>
                      ) : (
                        <span className="ml-2 text-gray-400">• 비공개</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {post.content && (
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              아직 작성된 포스트가 없습니다. 첫 번째 포스트를 작성해보세요!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

