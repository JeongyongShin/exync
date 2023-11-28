#!/usr/bin/env python
import os
import sys

def main():

    # print(os.environ['MYSQL_DB'])
    # print(os.environ['MYSQL_USER'])
    # print(os.environ['MYSQL_PWD'])

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        #from django.core.wsgi import get_wsgi_application
        #application = get_wsgi_application()
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
