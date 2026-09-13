export interface PushToGithubParams {
  token: string;
  owner: string;
  repo: string;
  filePath: string;
  content: object | string;
  message: string;
}

export async function pushToGithub({
  token,
  owner,
  repo,
  filePath,
  content,
  message
}: PushToGithubParams): Promise<{ success: boolean; commitUrl?: string; error?: string }> {
  try {
    const jsonStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    // Base64 encode with UTF-8 support
    const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // Check if file already exists to get its SHA for update
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch {
      // File doesn't exist yet, which is fine
    }

    const body: any = {
      message: message || `Add quiz dataset: ${filePath}`,
      content: base64Content
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Lỗi không xác định khi gọi GitHub API');
    }

    const data = await res.json();
    return {
      success: true,
      commitUrl: data.commit?.html_url
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}
