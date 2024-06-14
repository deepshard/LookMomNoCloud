"""init

Revision ID: 1f8454ff7200
Revises: 
Create Date: 2024-06-13 14:27:32.680928

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "1f8454ff7200"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "running_models",
        sa.Column("db_id", sa.String, primary_key=True, default="cuid()"),
        sa.Column("id", sa.String),
        sa.Column("instance", sa.Integer),
        sa.Column("name", sa.String),
        sa.Column("size", sa.BigInteger),
        sa.Column("pid", sa.Integer),
        sa.Column("port", sa.Integer),
        sa.Column("quantization", sa.String),
    )


def downgrade():
    op.drop_table("running_models")
