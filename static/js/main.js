const API = {
    get: async (url, params = {}) => {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(url + (qs ? '?' + qs : ''));
        // التعامل مع انتهاء الجلسة
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.errors ? err.errors.join(', ') : 'خطأ في الاتصال');
        }
        return res.json();
    },
    post: async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        const body = await res.json();
        if (!res.ok) throw new Error(body.errors ? body.errors.join(', ') : 'خطأ');
        return body;
    },
    put: async (url, data) => {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        const body = await res.json();
        if (!res.ok) throw new Error(body.errors ? body.errors.join(', ') : 'خطأ');
        return body;
    },
    del: async (url) => {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        const body = await res.json();
        if (!res.ok) throw new Error(body.errors ? body.errors.join(', ') : 'خطأ');
        return body;
    }
};


function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    t.style.backgroundColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
    setTimeout(() => t.style.display = 'none', 3500);
}

function renderTable(containerId, columns, data, total, page, perPage, loadFn, actionButtons = null) {
    const container = document.getElementById(containerId);
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // عمود التسلسل
    const thSeq = document.createElement('th');
    thSeq.textContent = 'م';
    headerRow.appendChild(thSeq);
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        headerRow.appendChild(th);
    });
    const thAction = document.createElement('th');
    thAction.textContent = 'إجراءات';
    headerRow.appendChild(thAction);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        // خلية التسلسل
        const tdSeq = document.createElement('td');
        tdSeq.textContent = (page - 1) * perPage + index + 1;
        tr.appendChild(tdSeq);
        columns.forEach(col => {
            const td = document.createElement('td');
            td.setAttribute('data-label', col.label);
            const value = col.render ? col.render(row) : (row[col.key] !== undefined ? row[col.key] : '');
            td.innerHTML = value;
            tr.appendChild(td);
        });
        const tdAction = document.createElement('td');
        tdAction.setAttribute('data-label', 'إجراءات');
        if (actionButtons) {
            tdAction.innerHTML = actionButtons(row);
        } else {
            tdAction.innerHTML = `
                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${row.id}">✏️</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${row.id}">🗑️</button>
            `;
        }
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const totalPages = Math.ceil(total / perPage);
    const paginationDiv = document.getElementById('pagination');
    if (paginationDiv) {
        let pagHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            pagHtml += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationDiv.innerHTML = pagHtml;
        paginationDiv.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function() {
                const p = parseInt(this.dataset.page);
                if (loadFn) loadFn(p);
            });
        });
    }

    // تفويض الأحداث
    wrapper.addEventListener('click', async function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action) return;
        // استدعاء دالة مخصصة إن وجدت
        if (typeof window['handleAction_' + action] === 'function') {
            window['handleAction_' + action](id, btn);
            return;
        }
        // إجراءات افتراضية
        if (action === 'edit' && typeof window.editItem === 'function') {
            window.editItem(id);
        } else if (action === 'delete' && typeof window.deleteItem === 'function') {
            if (confirm('هل أنت متأكد من الحذف؟')) {
                window.deleteItem(id);
            }
        }
    });
}

function openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }
function exportTable(entity, format) { window.open(`/api/export/${entity}?format=${format}`, '_blank'); }
