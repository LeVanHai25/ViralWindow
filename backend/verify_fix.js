const db = require('./config/db');
const SystemNotifier = require('./services/SystemNotifier');

async function verify() {
    try {
        console.log('🧪 Starting Verification of Phase 9 Fixes...');

        // Mock a request object for SystemNotifier.getActor
        const mockReq = {
            user: { id: 1, name: 'Verifier Admin' },
            ip: '127.0.0.1',
            headers: { 'user-agent': 'Verification Script' }
        };

        const actor = SystemNotifier.getActor(mockReq);

        console.log('   - Triggering customer.updated event...');
        // This will call AuditLogService.log and then createNotificationFromLog
        await SystemNotifier.notify('customer.updated', {
            entityName: 'Test Customer Verification',
            entityId: 999,
            actor: actor,
            beforeData: { full_name: 'Old Name' },
            afterData: { full_name: 'New Name' },
            changedFields: ['full_name']
        });

        console.log('   - Checking database for generated logs and notifications...');

        const [logs] = await db.query(
            'SELECT * FROM audit_logs WHERE entity_id = 999 AND entity_type = "customer" ORDER BY created_at DESC LIMIT 1'
        );

        if (logs.length > 0) {
            console.log('   ✅ Audit Log created successfully. ID:', logs[0].id);

            const [notifs] = await db.query(
                'SELECT * FROM notifications WHERE audit_log_id = ?',
                [logs[0].id]
            );

            if (notifs.length > 0) {
                console.log('   ✅ Notification created successfully. ID:', notifs[0].id, 'Type:', notifs[0].type);
                console.log('✨ Verification PASSED! All blockers resolved.');
            } else {
                console.error('   ❌ Notification NOT found for the audit log.');
            }
        } else {
            console.error('   ❌ Audit Log NOT found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Verification FAILED:', err.message);
        process.exit(1);
    }
}

verify();
