function updateProjectsKPI(projects) {
                const running = projects.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    const progress = parseFloat(p.progress_percent) || 0;
                    return status !== 'completed' && status !== 'handover' && status !== 'cancelled' && status !== 'paused' && progress < 100;
                }).length;

                const pending = projects.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    return status === 'pending' || status === 'quotation_pending' || status === 'waiting_quotation';
                }).length;

                const completed = projects.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    const progress = parseFloat(p.progress_percent) || 0;
                    return status === 'completed' || progress >= 100;
                }).length;

                const runningEl = document.querySelector('[data-projects-kpi="running"]');
                const pendingEl = document.querySelector('[data-projects-kpi="pending"]');
                const cancelledEl = document.querySelector('[data-projects-kpi="cancelled"]');
                const completedEl = document.querySelector('[data-projects-kpi="completed"]');

                if (runningEl) runningEl.textContent = running;
                if (pendingEl) pendingEl.textContent = pending;
                if (completedEl) completedEl.textContent = completed;

                // Fetch cancelled projects count from separate API
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (cancelledEl && token) {
                    fetch(`${API_BASE}/projects/cancelled`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success && result.data) {
                                cancelledEl.textContent = result.data.length;
                            }
                        })
                        .catch(err => console.warn('Could not fetch cancelled projects count:', err));
                }
            }

            // Render projects in tab
            function