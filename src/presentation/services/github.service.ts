
// =============================================
// 🔧 SERVICIO DE PROCESAMIENTO GITHUB
// 📁 services/github.service.ts
// =============================================
/*
📘 RESPONSABILIDADES DEL SERVICIO:
- Procesar payloads específicos de cada tipo de evento
- Extraer información relevante de los payloads complejos
- Generar mensajes user-friendly para Discord
- Manejar diferentes acciones dentro del mismo tipo de evento
- Validar estructura de payloads para evitar errores

🔍 TIPOS DE PAYLOAD:
- Cada evento de GitHub tiene estructura diferente
- Algunos eventos tienen múltiples acciones (opened/closed/edited)
- Payloads contienen información completa: user, repo, timestamps, etc.
*/

import { GitHubStartPayload, GutHubIssuePayload } from "../../interfaces";

export class GitHubService {
  constructor() {}

  // =============================================
  // ⭐ PROCESAMIENTO DE EVENTOS STAR
  // =============================================
  onStar(payload: GitHubStartPayload): string {
    /*
    📘 ESTRUCTURA DEL PAYLOAD DE STAR:
    {
      "action": "created" | "deleted",  // starred o unstarred
      "starred_at": "2023-01-01T00:00:00Z", // timestamp
      "sender": {
        "login": "username",
        "avatar_url": "https://...",
        "html_url": "https://github.com/username"
      },
      "repository": {
        "full_name": "owner/repo",
        "html_url": "https://github.com/owner/repo",
        "stargazers_count": 123
      }
    }
    */
    
    // 🎯 Extraer información relevante del payload
    const { action, sender, repository } = payload;
    // 👉 Destructuring para obtener los campos que necesitamos
    
    // 📝 Generar mensaje personalizado
    return `User ${sender.login} ${action} star on ${repository.full_name}`;
    // 👉 Ejemplo: "User john_doe created star on my-org/awesome-repo"
    //    Ejemplo: "User jane_smith deleted star on my-org/awesome-repo"
    
    /*
    🎨 MENSAJE MÁS DETALLADO:
    const actionText = action === 'created' ? '⭐ starred' : '💔 unstarred';
    const starCount = repository.stargazers_count;
    return `${actionText} **${repository.full_name}** by **${sender.login}**\n` +
           `Total stars: ${starCount} ⭐\n` +
           `Repository: ${repository.html_url}`;
    */
  }

  // =============================================
  // 🐛 PROCESAMIENTO DE EVENTOS ISSUES
  // =============================================
  onIssue(payload: GutHubIssuePayload): string {
    /*
    📘 ESTRUCTURA DEL PAYLOAD DE ISSUES:
    {
      "action": "opened" | "closed" | "reopened" | "edited" | ...,
      "issue": {
        "number": 123,
        "title": "Bug in authentication",
        "body": "Detailed description...",
        "state": "open" | "closed",
        "user": {
          "login": "reporter_username"
        },
        "html_url": "https://github.com/owner/repo/issues/123",
        "created_at": "2023-01-01T00:00:00Z",
        "closed_at": null | "2023-01-02T00:00:00Z"
      },
      "repository": { ... },
      "sender": { ... } // quien realizó la acción
    }
    */
    
    // 🎯 Extraer información del issue
    const { action, issue } = payload;
    // 👉 action: qué se hizo con el issue
    //    issue: objeto completo con toda la info del issue

    // =============================================
    // 🔄 MANEJO ESPECÍFICO POR ACCIÓN
    // =============================================
    
    // 🆕 Issue recién creado
    if (action === 'opened') {
      return `An issue was opened with this title ${issue.title}`;
      // 👉 Se podría agregar: número del issue, autor, labels, etc.
    }

    // ✅ Issue cerrado
    if (action === 'closed') {
      return `An issue was closed by ${issue.user.login}`;
      // 👉 user.login es quien REPORTÓ el issue, no quien lo cerró
      //    Para saber quién lo cerró, usar payload.sender.login
    }

    // 🔄 Issue reabierto
    if (action === 'reopened') {
      return `An issue was reopened by ${issue.user.login}`;
      // 👉 Similar al anterior, considera usar payload.sender.login
    }

    // ❓ Acción no manejada
    return `Unhandled action for the issue event ${action}`;
    // 👉 Útil para saber qué acciones llegan y no están implementadas
    
    /*
    🚀 IMPLEMENTACIÓN MÁS COMPLETA:

    switch (action) {
      case 'opened':
        return `🆕 **New Issue #${issue.number}**\n` +
               `**Title:** ${issue.title}\n` +
               `**Author:** ${issue.user.login}\n` +
               `**URL:** ${issue.html_url}`;

      case 'closed':
        const closer = payload.sender.login;
        return `✅ **Issue #${issue.number} Closed**\n` +
               `**Title:** ${issue.title}\n` +
               `**Closed by:** ${closer}\n` +
               `**Reporter:** ${issue.user.login}`;

      case 'reopened':
        return `🔄 **Issue #${issue.number} Reopened**\n` +
               `**Title:** ${issue.title}\n` +
               `**Reopened by:** ${payload.sender.login}`;

      case 'edited':
        return `✏️ **Issue #${issue.number} Edited**\n` +
               `**Title:** ${issue.title}\n` +
               `**Edited by:** ${payload.sender.login}`;

      case 'labeled':
      case 'unlabeled':
        const labelAction = action === 'labeled' ? 'added to' : 'removed from';
        const label = payload.label.name;
        return `🏷️ Label "${label}" ${labelAction} issue #${issue.number}`;

      default:
        return `❓ Unknown issue action: ${action} on #${issue.number}`;
    }
    */
  }
  
  /*
  🚀 MÉTODOS ADICIONALES PARA OTROS EVENTOS:

  // 🔧 Procesamiento de Push events
  onPush(payload: GitHubPushPayload): string {
    const { commits, pusher, repository, ref } = payload;
    const branch = ref.split('/').pop(); // extraer nombre de rama
    const commitCount = commits.length;
    
    if (commitCount === 0) return `Empty push to ${branch} by ${pusher.name}`;
    
    const commitList = commits.slice(0, 3) // máximo 3 commits
      .map(commit => `• ${commit.message.split('\n')[0]}`) // primera línea
      .join('\n');
    
    return `📤 **${commitCount} commit(s)** pushed to **${branch}** by **${pusher.name}**\n` +
           `Repository: ${repository.full_name}\n` +
           `Commits:\n${commitList}` +
           (commitCount > 3 ? `\n... and ${commitCount - 3} more` : '');
  }

  // 🔀 Procesamiento de Pull Request events
  onPullRequest(payload: GitHubPullRequestPayload): string {
    const { action, pull_request, repository } = payload;
    const pr = pull_request;
    
    switch (action) {
      case 'opened':
        return `🔀 **New Pull Request #${pr.number}**\n` +
               `**Title:** ${pr.title}\n` +
               `**Author:** ${pr.user.login}\n` +
               `**From:** ${pr.head.ref} → ${pr.base.ref}\n` +
               `**URL:** ${pr.html_url}`;
               
      case 'closed':
        const merged = pr.merged ? '✅ merged' : '❌ closed without merging';
        return `🔀 **PR #${pr.number} ${merged}**\n` +
               `**Title:** ${pr.title}`;
               
      case 'review_requested':
        return `👀 **Review requested** on PR #${pr.number}\n` +
               `**Title:** ${pr.title}\n` +
               `**Reviewer:** ${payload.requested_reviewer.login}`;
               
      default:
        return `🔀 PR #${pr.number} ${action}`;
    }
  }

  // 🚀 Procesamiento de Release events
  onRelease(payload: GitHubReleasePayload): string {
    const { action, release, repository } = payload;
    
    if (action === 'published') {
      return `🚀 **New Release ${release.tag_name}**\n` +
             `**Repository:** ${repository.full_name}\n` +
             `**Release Notes:** ${release.name}\n` +
             `**URL:** ${release.html_url}`;
    }
    
    return `🚀 Release ${release.tag_name} ${action}`;
  }
  */
}
