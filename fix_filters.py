import sys

def modify_file(filepath, search_str, replace_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_str in content:
        content = content.replace(search_str, replace_str)
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Replaced in {filepath}")
    else:
        print(f"Not found in {filepath}")

search_prod = """                    const activeProjects = projects.filter(p =>
                        p.status !== 'cancelled' && p.status !== 'paused' && p.status !== 'completed'
                    );"""

replace_prod = """                    const activeProjects = projects.filter(p => {
                        const progress = parseFloat(p.progress_percent) || 0;
                        return p.status !== 'cancelled' && 
                               p.status !== 'paused' && 
                               p.status !== 'completed' &&
                               p.status !== 'handover' &&
                               progress < 100;
                    });"""

modify_file('FontEnd/production.html', search_prod.replace('\n', '\r\n'), replace_prod.replace('\n', '\r\n'))
modify_file('FontEnd/production.html', search_prod, replace_prod)

# For projects.html
search_proj = """                    projectsData = (result.data || []).filter(project => {
                        const status = (project.status || '').toLowerCase();
                        const progress = parseFloat(project.progress_percent) || 0;
                        // Loại bỏ dự án đã hoàn thành
                        return status !== 'completed' && progress < 100;
                    });"""

replace_proj = """                    projectsData = (result.data || []).filter(project => {
                        const status = (project.status || '').toLowerCase();
                        const progress = parseFloat(project.progress_percent) || 0;
                        return status !== 'completed' && status !== 'handover' && status !== 'cancelled' && status !== 'paused' && progress < 100;
                    });"""

modify_file('FontEnd/projects.html', search_proj.replace('\n', '\r\n'), replace_proj.replace('\n', '\r\n'))
modify_file('FontEnd/projects.html', search_proj, replace_proj)

# For projects-new.html
search_proj_new = """                        projects = projects.filter(p => {
                            const progress = parseFloat(p.progress_percent) || 0;
                            const status = (p.status || '').toLowerCase();
                            // Bỏ các dự án đã hoàn thành 100% hoặc status = 'completed' hoặc 'handover'
                            return progress < 100 && status !== 'completed' && status !== 'handover';
                        });"""

replace_proj_new = """                        projects = projects.filter(p => {
                            const progress = parseFloat(p.progress_percent) || 0;
                            const status = (p.status || '').toLowerCase();
                            // Bỏ các dự án đã hoàn thành 100% hoặc status = 'completed' hoặc 'handover' hoặc bị huỷ/tạm dừng
                            return progress < 100 && status !== 'completed' && status !== 'handover' && status !== 'cancelled' && status !== 'paused';
                        });"""
                        
modify_file('FontEnd/projects-new.html', search_proj_new.replace('\n', '\r\n'), replace_proj_new.replace('\n', '\r\n'))
modify_file('FontEnd/projects-new.html', search_proj_new, replace_proj_new)

# KPI in projects-new.html
search_kpi_new = """                const running = projects.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    const progress = parseFloat(p.progress_percent) || 0;
                    return status !== 'completed' && progress < 100;
                }).length;"""

replace_kpi_new = """                const running = projects.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    const progress = parseFloat(p.progress_percent) || 0;
                    return status !== 'completed' && status !== 'handover' && status !== 'cancelled' && status !== 'paused' && progress < 100;
                }).length;"""

modify_file('FontEnd/projects-new.html', search_kpi_new.replace('\n', '\r\n'), replace_kpi_new.replace('\n', '\r\n'))
modify_file('FontEnd/projects-new.html', search_kpi_new, replace_kpi_new)
